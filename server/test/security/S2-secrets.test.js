import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = fileURLToPath(new URL('../../', import.meta.url));
const srcRoot = path.join(serverRoot, 'src');

// The settings the marker gives the server, minus whatever a case removes. The database URL points
// at a closed port: the pool connects lazily, so starting the server does not need a database.
function baseEnv() {
  return {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    PORT: '0',
    DATABASE_URL: 'postgres://clubflow@127.0.0.1:1/clubflow_unreachable',
    JWT_SECRET: 'only-this-test-starts-a-server-with-this-value',
    JWT_EXPIRES_IN: '8h',
    UPLOAD_DIR: path.join(serverRoot, 'uploads'),
    APP_TODAY: '2026-11-18',
  };
}

// Starts `node src/server.js` directly: no --env-file flag, so nothing is read from server/.env.
function startServer(env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['src/server.js'], { cwd: serverRoot, env });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (result) => {
      if (!settled) {
        settled = true;
        resolve({ ...result, stdout, stderr, child });
      }
    };
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      const match = stdout.match(/listening on port (\d+)/);
      if (match) finish({ started: true, port: Number(match[1]) });
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('exit', (code) => finish({ started: false, exitCode: code }));
    setTimeout(() => finish({ started: false, exitCode: null }), 10_000);
  });
}

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listSourceFiles(fullPath) : [fullPath];
    }),
  );
  return files.flat().filter((file) => file.endsWith('.js'));
}

describe('S2 a secret in the code', () => {
  it('S2 the server stops with a message when JWT_SECRET is missing, and starts when it is set', async () => {
    const env = baseEnv();
    delete env.JWT_SECRET;

    const withoutSecret = await startServer(env);
    withoutSecret.child.kill();

    expect(withoutSecret.started).toBe(false);
    expect(withoutSecret.exitCode).not.toBe(0);
    expect(withoutSecret.stderr).toContain('JWT_SECRET');

    const withSecret = await startServer(baseEnv());
    try {
      expect(withSecret.started).toBe(true);
      const response = await fetch(`http://127.0.0.1:${withSecret.port}/api/no-such-path`);
      expect(response.status).toBe(404);
    } finally {
      withSecret.child.kill();
    }
  }, 30_000);

  it('S2 only config/env.js reads process.env, so no other module can fall back to a default secret', async () => {
    const files = await listSourceFiles(srcRoot);
    const readers = [];
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      if (source.includes('process.env')) readers.push(path.relative(srcRoot, file));
    }

    expect(readers).toEqual([path.join('config', 'env.js')]);
  });

  it('S2 config/env.js has no fallback value for JWT_SECRET or DATABASE_URL', async () => {
    const source = await readFile(path.join(srcRoot, 'config', 'env.js'), 'utf8');

    expect(source).not.toMatch(/JWT_SECRET\s*(\|\||\?\?)/);
    expect(source).not.toMatch(/DATABASE_URL\s*(\|\||\?\?)/);
  });
});
