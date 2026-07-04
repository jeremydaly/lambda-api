// Shared helpers for the Layer 1 (no-Docker) e2e suite.
//
// The suite installs the REAL packed tarball into isolated fixture roots and runs each
// consumer app in its own child process, so module resolution honors the published `exports`
// map + `files` whitelist — the exact thing the in-repo module-compat tests miss (they load
// dist/ directly with the optional AWS SDK present).

import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const E2E_DIR = join(HERE, '..');
export const REPO_ROOT = join(E2E_DIR, '..');
export const FIXTURES = join(E2E_DIR, 'fixtures');

const results = [];
let currentFixture = '(setup)';

export function section(name) {
  currentFixture = name;
  process.stdout.write(`\n▸ ${name}\n`);
}

export function check(desc, fn) {
  try {
    fn();
    results.push({ ok: true, fixture: currentFixture, desc });
    process.stdout.write(`  ✓ ${desc}\n`);
  } catch (err) {
    results.push({ ok: false, fixture: currentFixture, desc, err: err.message });
    process.stdout.write(`  ✗ ${desc}\n      ${String(err.message).split('\n')[0]}\n`);
  }
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

export function summarize() {
  const failed = results.filter((r) => !r.ok);
  process.stdout.write(
    `\n${'='.repeat(60)}\nLayer 1: ${results.length - failed.length}/${results.length} checks passed\n`
  );
  if (failed.length) {
    process.stdout.write('\nFAILURES:\n');
    for (const f of failed) process.stdout.write(`  - [${f.fixture}] ${f.desc}\n      ${f.err}\n`);
  }
  return failed.length === 0;
}

// npm pack the repo once; returns the absolute path to the produced .tgz.
export function packTarball() {
  const out = execFileSync('npm', ['pack', '--silent', '--pack-destination', tmpdir()], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  }).trim();
  const tgz = join(tmpdir(), out.split('\n').pop().trim());
  assert(existsSync(tgz), `npm pack did not produce a tarball (${tgz})`);
  return tgz;
}

// Create a fresh temp project dir with the tarball (and optional extra deps) installed.
// `deps` e.g. ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'].
export function makeInstallRoot(label, tgz, deps = []) {
  const root = mkdtempSync(join(tmpdir(), `lambda-api-e2e-${label}-`));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: `e2e-${label}`, private: true }, null, 2));
  const args = ['install', '--no-audit', '--no-fund', '--loglevel=error', tgz, ...deps];
  execFileSync('npm', args, { cwd: root, stdio: 'pipe' });
  return root;
}

// Copy a fixture directory into an install root (so it resolves lambda-api from ../node_modules).
export function stageFixture(installRoot, fixtureName) {
  const dest = join(installRoot, fixtureName);
  cpSync(join(FIXTURES, fixtureName), dest, { recursive: true });
  return dest;
}

export function writeEvent(dir, name, obj) {
  const p = join(dir, name);
  writeFileSync(p, JSON.stringify(obj));
  return p;
}

// Run `node <script> <eventPath>` in `cwd`; return { stdout, stderr, status }.
export function runNode(cwd, script, eventPath, env = {}) {
  try {
    const stdout = execFileSync('node', [script, eventPath], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { stdout, status: 0 };
  } catch (err) {
    return { stdout: err.stdout || '', stderr: err.stderr || err.message, status: err.status || 1 };
  }
}

// Bundle a handler with esbuild; returns { status, stderr, outfile }.
export function esbuild(cwd, entry, outfile, extraArgs = []) {
  try {
    execFileSync(
      'npx',
      ['--yes', 'esbuild', entry, '--bundle', `--outfile=${outfile}`, ...extraArgs],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    return { status: 0, outfile };
  } catch (err) {
    return { status: err.status || 1, stderr: (err.stderr || '') + (err.stdout || ''), outfile };
  }
}

export function apiGatewayV1(path, method = 'GET', body = null) {
  return {
    httpMethod: method,
    path,
    headers: { 'content-type': 'application/json' },
    multiValueHeaders: { 'content-type': ['application/json'] },
    body: body == null ? null : JSON.stringify(body),
    isBase64Encoded: false,
    requestContext: { stage: 'test', identity: { sourceIp: '127.0.0.1' } },
  };
}

export function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}
