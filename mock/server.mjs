import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { delay, json, projectForMode, responseForError } from './lib/http.mjs';
import { routeRequest } from './lib/routes.mjs';
import { createState, resetState } from './lib/state.mjs';

const VALID_MODES = new Set(['normal', 'slow', 'error', 'empty']);

async function toRequest(incoming, baseUrl) {
  const chunks = [];
  for await (const chunk of incoming) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(new URL(incoming.url, baseUrl), {
    method: incoming.method,
    headers: incoming.headers,
    body,
  });
}

async function send(outgoing, response) {
  outgoing.statusCode = response.status;
  for (const [name, value] of response.headers) outgoing.setHeader(name, value);
  if (response.status === 204 || response.status === 304) {
    outgoing.end();
    return;
  }
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}

export function createMockServer(options = {}) {
  const mode = options.mode ?? process.env.MOCK_MODE ?? 'normal';
  if (!VALID_MODES.has(mode)) throw new Error(`Invalid MOCK_MODE "${mode}". Expected normal, slow, error, or empty.`);
  const slowDelayMs = options.slowDelayMs ?? 2000;
  const normalDelayMs = options.normalDelayMs ?? 150;
  const state = options.state ?? createState();
  const logger = options.logger ?? console;
  const logs = [];
  const server = createServer(async (incoming, outgoing) => {
    const startedAt = performance.now();
    let request;
    let response;
    try {
      request = await toRequest(incoming, `http://${incoming.headers.host ?? 'localhost'}`);
      const pathname = new URL(request.url).pathname;
      await delay(mode === 'slow' ? slowDelayMs : normalDelayMs);
      const isSignIn = request.method === 'POST' && pathname === '/api/auth/login';
      if (request.method === 'OPTIONS') {
        response = new Response(null, { status: 204 });
      } else if (mode === 'error' && !isSignIn) {
        // Brief: error mode returns 500 for every request except sign-in.
        response = json(500, { error: 'The mock is running in deterministic error mode.', code: 'MOCK_ERROR_MODE' });
      } else {
        response = await routeRequest({ request, state });
        response = await projectForMode(response, mode);
      }
    } catch (error) {
      response = responseForError(error);
    }
    const entry = {
      method: incoming.method,
      path: incoming.url,
      status: response.status,
      mode,
      durationMs: Math.round(performance.now() - startedAt),
    };
    logs.push(entry);
    logger.info?.(JSON.stringify(entry));
    await send(outgoing, response);
  });

  return {
    server,
    state,
    mode,
    logs,
    reset: () => resetState(state),
    async listen(port = 0, host = '127.0.0.1') {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, resolve);
      });
      const address = server.address();
      return `http://${host}:${address.port}`;
    },
    async close() {
      if (!server.listening) return;
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

async function main() {
  const port = Number(process.env.MOCK_PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('MOCK_PORT must be an integer from 1 to 65535.');
  const mock = createMockServer();
  const baseUrl = await mock.listen(port, '0.0.0.0');
  console.info(`ClubFlow PA#3 mock listening at ${baseUrl} in ${mock.mode} mode.`);
  const shutdown = async () => {
    await mock.close();
    process.exitCode = 0;
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (entryPath === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
