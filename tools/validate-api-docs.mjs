import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_FILES = [
  'README.md',
  '00-resource-models.md',
  '01-auth-profile.md',
  '02-public-applicant.md',
  '03-review-files.md',
  '04-scheduling.md',
  '05-interviewer.md',
  '06-results-notifications.md',
  '07-campaign-management.md',
];

const ALLOWED_TOKENS = new Set(['exec', 'studentA', 'studentB', 'int-content', 'int-comms']);

function normalizePath(value) {
  return value.split('?')[0];
}

function pathPattern(documentedPath) {
  const escaped = documentedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\\\{[^}]+\\\}/g, '[^/?\\s]+')}$`);
}

function fencedBlocks(source) {
  const blocks = [];
  const pattern = /```(http|sh)\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = pattern.exec(source))) {
    blocks.push({
      language: match[1],
      body: match[2],
      start: match.index,
      end: pattern.lastIndex,
      firstLine: match[2].split(/\r?\n/).find((line) => line.trim())?.trim() ?? '',
    });
  }
  return blocks;
}

function requestFromBlock(block) {
  if (block.language === 'http') {
    const match = block.firstLine.match(/^(GET|POST|PATCH|PUT|DELETE)\s+(\/api\/[^\s]*)\s+HTTP\/1\.1$/);
    return match ? { method: match[1], path: normalizePath(match[2]) } : null;
  }
  if (!/\bcurl\b/.test(block.body) || !/\/api\//.test(block.body)) {
    return null;
  }
  const method = block.body.match(/(?:^|\s)-X\s+(GET|POST|PATCH|PUT|DELETE)\b/)?.[1] ?? 'GET';
  const url = block.body.match(/https?:\/\/[^\s"']+(\/api\/[^\s"']*)/)?.[1];
  return url ? { method, path: normalizePath(url.replace(/\\$/, '')) } : null;
}

export function validateApiDocs(repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const apiDir = join(repositoryRoot, 'docs', 'api');
  const errors = [];
  const sources = new Map();

  for (const file of REQUIRED_FILES) {
    const fullPath = join(apiDir, file);
    if (!existsSync(fullPath)) {
      errors.push(`Missing required contract file: docs/api/${file}`);
      continue;
    }
    const source = readFileSync(fullPath, 'utf8');
    sources.set(file, source);
    if (!/^## Changes\s*$/m.test(source)) {
      errors.push(`${file} is missing an exact ## Changes section.`);
    }
  }

  const readme = sources.get('README.md') ?? '';
  for (let step = 1; step <= 11; step += 1) {
    if (!new RegExp(`^\\| C${step} \\|`, 'm').test(readme)) {
      errors.push(`README.md is missing C${step} from the coverage table.`);
    }
  }

  const inventory = [];
  const inventoryPattern = /^\|\s*(GET|POST|PATCH|PUT|DELETE)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*$/gm;
  let inventoryMatch;
  while ((inventoryMatch = inventoryPattern.exec(readme))) {
    const [, method, path, role, documentCell] = inventoryMatch;
    const linkedFile = documentCell.match(/\]\(([^)]+)\)/)?.[1] ?? (path === '/api/health' ? 'README.md' : null);
    inventory.push({ method, path, role: role.trim(), linkedFile });
  }

  const duplicateKeys = new Set();
  const seenKeys = new Set();
  for (const endpoint of inventory) {
    const key = `${endpoint.method} ${endpoint.path}`;
    if (seenKeys.has(key)) duplicateKeys.add(key);
    seenKeys.add(key);
    if (!endpoint.linkedFile || !sources.has(endpoint.linkedFile)) {
      errors.push(`${key} links to a missing or invalid resource document.`);
      continue;
    }
    const target = sources.get(endpoint.linkedFile);
    if (endpoint.path !== '/api/health' && !target.includes(`## ${endpoint.method} ${endpoint.path}`)) {
      errors.push(`${key} has no matching endpoint heading in ${endpoint.linkedFile}.`);
    }
  }
  for (const key of duplicateKeys) errors.push(`Duplicate endpoint inventory entry: ${key}`);

  const allExamples = [];
  for (const [file, source] of sources) {
    const blocks = fencedBlocks(source);
    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      const request = requestFromBlock(block);
      if (!request) continue;
      allExamples.push({ ...request, file });
      const response = blocks[index + 1];
      if (!response || response.language !== 'http' || !/^HTTP\/1\.1\s+\d{3}\b/.test(response.firstLine)) {
        errors.push(`${file}: ${request.method} ${request.path} is not immediately paired with an HTTP response block.`);
        continue;
      }
      if (source.slice(block.end, response.start).trim() !== '') {
        errors.push(`${file}: text appears between ${request.method} ${request.path} and its response block.`);
      }
    }
  }

  for (const endpoint of inventory) {
    const pattern = pathPattern(endpoint.path);
    const covered = allExamples.some((example) => example.method === endpoint.method && pattern.test(example.path));
    if (!covered) errors.push(`${endpoint.method} ${endpoint.path} has no executable request/response example.`);
  }

  for (const [file, source] of sources) {
    const tokenPattern = /\{\{token:([^}]+)\}\}/g;
    let tokenMatch;
    while ((tokenMatch = tokenPattern.exec(source))) {
      if (!ALLOWED_TOKENS.has(tokenMatch[1])) errors.push(`${file}: unsupported token placeholder ${tokenMatch[0]}.`);
    }
    const filePattern = /\{\{file:([^}]+)\}\}/g;
    let fileMatch;
    while ((fileMatch = filePattern.exec(source))) {
      if (fileMatch[1] !== 'cv.pdf:200KB') errors.push(`${file}: unsupported file placeholder ${fileMatch[0]}.`);
    }
    const markdownLinkPattern = /\[[^\]]+\]\(([^)]+\.md)\)/g;
    let linkMatch;
    while ((linkMatch = markdownLinkPattern.exec(source))) {
      const target = resolve(apiDir, linkMatch[1]);
      if (!existsSync(target) && !existsSync(resolve(apiDir, file, '..', linkMatch[1]))) {
        errors.push(`${file}: broken Markdown link ${linkMatch[1]}.`);
      }
    }
  }

  if (!/"username"\s*:\s*"exec"/.test(sources.get('01-auth-profile.md') ?? '')) {
    errors.push('01-auth-profile.md does not demonstrate username-based Executive login.');
  }
  const authBlocks = fencedBlocks(sources.get('01-auth-profile.md') ?? '');
  for (const block of authBlocks) {
    const request = requestFromBlock(block);
    if (request?.method === 'POST' && request.path === '/api/auth/login' && /"handle"\s*:/.test(block.body)) {
      errors.push('Login request examples must not use handle as the request field.');
    }
  }

  return {
    errors,
    stats: {
      files: sources.size,
      endpoints: inventory.length,
      examples: allExamples.length,
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateApiDocs();
  if (result.errors.length) {
    for (const error of result.errors) process.stderr.write(`- ${error}\n`);
    process.stderr.write(`Contract validation failed with ${result.errors.length} issue(s).\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Contract validation passed: ${result.stats.files} files, ${result.stats.endpoints} endpoints, ${result.stats.examples} request examples.\n`,
    );
  }
}
