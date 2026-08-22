// Layer 1 e2e — fast, no Docker.
//
// Packs the REAL tarball, installs it into isolated roots (with/without the optional AWS SDK),
// and drives each consumer fixture in its own child process with a synthetic API Gateway event.
// Proves: CJS + ESM load/run, deep imports, esbuild .mjs bundling (issue #295), TypeScript
// node16 resolution, the `exports` map, that the package loads WITHOUT the optional SDK, and
// that the S3 signed-URL path still works after the lazy refactor.

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import {
  section, check, assert, summarize, packTarball, makeInstallRoot, stageFixture,
  writeEvent, runNode, apiGatewayV1, REPO_ROOT,
} from './helpers/harness.mjs';

function parseResponse(res, label) {
  assert(res.status === 0, `${label}: process exited ${res.status}\n${res.stderr || ''}`);
  let out;
  try {
    out = JSON.parse(res.stdout);
  } catch {
    throw new Error(`${label}: stdout was not JSON:\n${res.stdout}\n${res.stderr || ''}`);
  }
  return out;
}

function assertNoDynamicRequire(text, label) {
  assert(!/Dynamic require of/.test(text), `${label}: found "Dynamic require of ..." (issue #295 regression)`);
  assert(!/Cannot find module/.test(text), `${label}: "Cannot find module" in output`);
}

console.log('lambda-api e2e — Layer 1 (no Docker)');
const tgz = packTarball();
console.log(`packed: ${tgz}`);

// ── base env: tarball only (NO optional @aws-sdk) + esbuild for bundling tests ───────────────
const base = makeInstallRoot('base', tgz, ['esbuild@^0.25.0']);
const esbuildBin = join(base, 'node_modules', '.bin', 'esbuild');
const ev1 = writeEvent(base, 'event-v1.json', apiGatewayV1('/'));
const evUser = writeEvent(base, 'event-user.json', apiGatewayV1('/users/42'));
const evPost = writeEvent(base, 'event-post.json', apiGatewayV1('/users', 'POST', { name: 'ada' }));

// 1. CJS baseline (also proves: loads WITHOUT the optional AWS SDK)
section('cjs-require (no optional @aws-sdk installed)');
{
  const dir = stageFixture(base, 'cjs');
  check('GET / -> 200 {hello:world}', () => {
    const r = parseResponse(runNode(dir, 'handler.js', ev1), 'cjs /');
    assert(r.statusCode === 200, `status ${r.statusCode}`);
    assert(JSON.parse(r.body).hello === 'world', 'body.hello');
  });
  check('GET /users/42 -> path param', () => {
    const r = parseResponse(runNode(dir, 'handler.js', evUser), 'cjs /users');
    assert(JSON.parse(r.body).id === '42', 'body.id');
  });
  check('POST /users -> parsed JSON body', () => {
    const r = parseResponse(runNode(dir, 'handler.js', evPost), 'cjs post');
    assert(JSON.parse(r.body).created.name === 'ada', 'body.created.name');
  });
}

// 2. ESM baseline (also proves: loads WITHOUT the optional AWS SDK)
section('esm-import (no optional @aws-sdk installed)');
{
  const dir = stageFixture(base, 'esm');
  check('GET / -> 200 {hello:world}', () => {
    const r = parseResponse(runNode(dir, 'handler.mjs', ev1), 'esm /');
    assert(r.statusCode === 200 && JSON.parse(r.body).hello === 'world', 'body');
  });
}

// 2b. An S3 route WITHOUT the optional SDK must fail gracefully (handled 5xx), never crash
//     the process with an unhandled rejection (regression guard: getSignedUrl must not reject).
section('s3 route without @aws-sdk -> graceful 5xx (no unhandled rejection)');
{
  const dir = stageFixture(base, 's3-no-sdk');
  check('non-S3 route still 200', () => {
    const r = parseResponse(runNode(dir, 'handler.js', writeEvent(dir, 'ok.json', apiGatewayV1('/ok'))), 's3-no-sdk /ok');
    assert(r.statusCode === 200, `status ${r.statusCode}`);
  });
  check('S3 route -> handled 5xx, process did not crash', () => {
    const res = runNode(dir, 'handler.js', writeEvent(dir, 'link.json', apiGatewayV1('/link')));
    assert(res.status === 0, `process crashed (unhandled rejection?) status=${res.status}\n${res.stderr || ''}`);
    const r = JSON.parse(res.stdout);
    assert(r.statusCode >= 500 && r.statusCode < 600, `expected 5xx, got ${r.statusCode}`);
  });
}

// 3. deep imports via the exports `./lib/*` map
section('deep-import lambda-api/lib/utils (cjs + esm)');
{
  const dcjs = stageFixture(base, 'deep-import-cjs');
  check('cjs require("lambda-api/lib/utils")', () => {
    const r = parseResponse(runNode(dcjs, 'handler.js', ev1), 'deep cjs');
    assert(JSON.parse(r.body).hasFn === true, 'escapeHtml resolved');
  });
  const desm = stageFixture(base, 'deep-import-esm');
  check('esm import "lambda-api/lib/utils.js"', () => {
    const r = parseResponse(runNode(desm, 'handler.mjs', ev1), 'deep esm');
    assert(JSON.parse(r.body).hasFn === true, 'escapeHtml resolved');
  });
}

// 4. esbuild bundling — the issue #295 proof
section('esbuild bundle (issue #295: no "Dynamic require")');
{
  const esmDir = join(base, 'esm');
  const cjsDir = join(base, 'cjs');
  // ESM/.mjs bundle (the exact #295 scenario). @aws-sdk marked external (documented approach).
  check('esbuild --format=esm --platform=node bundles + runs clean', () => {
    const outfile = join(esmDir, 'bundle.mjs');
    try {
      execFileSync(
        esbuildBin,
        ['handler.mjs', '--bundle', '--format=esm', '--platform=node', '--external:@aws-sdk/*', `--outfile=${outfile}`],
        { cwd: esmDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } catch (e) {
      throw new Error(`esbuild failed: ${(e.stderr || '') + (e.stdout || '')}`);
    }
    const r = runNode(esmDir, 'bundle.mjs', ev1);
    assertNoDynamicRequire((r.stdout || '') + (r.stderr || ''), 'esm-bundle');
    const out = parseResponse(r, 'esm-bundle');
    assert(out.statusCode === 200 && JSON.parse(out.body).hello === 'world', 'bundled esm response');
  });
  // CJS bundle
  check('esbuild --format=cjs --platform=node bundles + runs clean', () => {
    const outfile = join(cjsDir, 'bundle.cjs');
    try {
      execFileSync(
        esbuildBin,
        ['handler.js', '--bundle', '--format=cjs', '--platform=node', '--external:@aws-sdk/*', `--outfile=${outfile}`],
        { cwd: cjsDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } catch (e) {
      throw new Error(`esbuild failed: ${(e.stderr || '') + (e.stdout || '')}`);
    }
    const r = runNode(cjsDir, 'bundle.cjs', ev1);
    assertNoDynamicRequire((r.stdout || '') + (r.stderr || ''), 'cjs-bundle');
    const out = parseResponse(r, 'cjs-bundle');
    assert(out.statusCode === 200, 'bundled cjs response');
  });
}

// 4b. issue #346 — an ESM entry bundled to CJS must not lose the consumer's own exports.
//     esbuild resolves lambda-api through the `import` condition here and inlines dist/esm into
//     a generated CommonJS wrapper, so any `module.exports = ...` in the ESM artifact lands on
//     the BUNDLE's exports. On Lambda that shows up as `Runtime.HandlerNotFound`.
section('esbuild ESM entry -> cjs output (issue #346: consumer exports survive)');
{
  const dir = stageFixture(base, 'esm-to-cjs-bundle');
  check('bundles, keeps `handler` export, and returns 200', () => {
    try {
      execFileSync(
        esbuildBin,
        ['handler.mjs', '--bundle', '--format=cjs', '--platform=node', '--external:@aws-sdk/*', '--outfile=bundle.cjs'],
        { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } catch (e) {
      throw new Error(`esbuild failed: ${(e.stderr || '') + (e.stdout || '')}`);
    }
    const r = parseResponse(runNode(dir, 'invoke.cjs', ev1), 'esm-to-cjs-bundle');
    assert(
      r.handlerType === 'function',
      `bundle exports ${JSON.stringify(r.keys)} — handler is ${r.handlerType} (issue #346 regression)`
    );
    assert(r.keys.includes('handler'), `expected 'handler' in exports, got ${JSON.stringify(r.keys)}`);
    assert(r.response && r.response.statusCode === 200, `status ${r.response && r.response.statusCode}`);
    assert(JSON.parse(r.response.body).hello === 'world', 'body.hello');
  });
}

// 5. exports map subpath resolution (root, lib/*, lib/*.js, package.json)
section('exports map subpath resolution');
{
  const req = createRequire(join(base, 'package.json'));
  check('resolve "lambda-api"', () => assert(typeof req('lambda-api') === 'function', 'root not a function'));
  check('resolve "lambda-api/lib/utils"', () => assert(typeof req('lambda-api/lib/utils').escapeHtml === 'function', 'utils'));
  check('resolve "lambda-api/lib/utils.js"', () => assert(typeof req('lambda-api/lib/utils.js').escapeHtml === 'function', 'utils.js'));
  check('resolve "lambda-api/package.json"', () => assert(req('lambda-api/package.json').name === 'lambda-api', 'package.json export'));
}

// 6. S3 signed-URL path WITH the optional SDK (getLink signs offline)
section('with @aws-sdk installed: S3 getLink signs a URL');
{
  const s3root = makeInstallRoot('s3', tgz, ['@aws-sdk/client-s3@^3.470.0', '@aws-sdk/s3-request-presigner@^3.470.0']);
  const s3ev = writeEvent(s3root, 'event.json', apiGatewayV1('/link'));
  const dir = stageFixture(s3root, 's3');
  check('GET /link -> presigned URL for s3://my-bucket/path/key.txt', () => {
    const r = parseResponse(runNode(dir, 'handler.mjs', s3ev), 's3 link');
    assert(r.statusCode === 200, `status ${r.statusCode}: ${r.body}`);
    const url = JSON.parse(r.body).url;
    assert(typeof url === 'string' && url.includes('my-bucket') && url.includes('X-Amz-Signature'), `unexpected url: ${url}`);
  });
}

// 7. TypeScript node16 module resolution + types
section('typescript (moduleResolution node16) import + types');
{
  const tsroot = makeInstallRoot('ts', tgz, ['typescript@^5', '@types/node@^20', '@types/aws-lambda@^8']);
  const dir = stageFixture(tsroot, 'typescript');
  const tsc = join(tsroot, 'node_modules', '.bin', 'tsc');
  check('tsc compiles (default import + types resolve under node16)', () => {
    try {
      execFileSync(tsc, ['-p', 'tsconfig.json'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      throw new Error(`tsc failed:\n${(e.stdout || '') + (e.stderr || '')}`);
    }
  });
  check('compiled handler runs -> 200', () => {
    const ev = writeEvent(dir, 'event.json', apiGatewayV1('/'));
    const r = parseResponse(runNode(dir, join('dist', 'handler.js'), ev), 'ts run');
    assert(r.statusCode === 200 && JSON.parse(r.body).lang === 'ts', 'ts response');
  });
}

process.exit(summarize() ? 0 : 1);
