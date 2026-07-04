// Layer 2 e2e — LocalStack (real AWS Lambda Node runtime + real S3 + API Gateway).
//
// Proves the dual package works on the ACTUAL Lambda runtime — the environment where issue
// #295 (`Dynamic require of "querystring"`) bit at cold start — across CJS, ESM, an
// esbuild-bundled .mjs, and the S3 path against real S3. Deploys functions to LocalStack,
// invokes them (directly and through API Gateway), and asserts responses + logs.
//
// Usage: `node e2e/localstack/run-all.mjs`  (starts compose, deploys, tests, tears down)
// Requires: Docker running. Uses the @aws-sdk clients installed in this folder.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packTarball, makeInstallRoot } from '../helpers/harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const HANDLERS = join(HERE, 'handlers');
const ENDPOINT = 'http://localhost:4566';
const REGION = 'us-east-1';
const CREDS = { accessKeyId: 'test', secretAccessKey: 'test' };
const ROLE = 'arn:aws:iam::000000000000:role/lambda-role';
const BUCKET = 'lambda-api-e2e';
const RUNTIME = 'nodejs20.x';

const results = [];
const check = async (desc, fn) => {
  try {
    await fn();
    results.push({ ok: true, desc });
    console.log(`  ✓ ${desc}`);
  } catch (err) {
    results.push({ ok: false, desc, err: err.message });
    console.log(`  ✗ ${desc}\n      ${String(err.message).split('\n')[0]}`);
  }
};
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

function zipDir(dir) {
  const out = join(tmpdir(), `lambda-zip-${Math.abs(hash(dir))}.zip`);
  try { sh('rm', ['-f', out]); } catch {}
  sh('zip', ['-r', '-q', out, '.'], { cwd: dir });
  return readFileSync(out);
}
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

function apiGatewayV1(path, method = 'GET') {
  return {
    httpMethod: method, path, resource: path,
    headers: { 'content-type': 'application/json', Host: 'localhost' },
    multiValueHeaders: { 'content-type': ['application/json'] },
    queryStringParameters: null, pathParameters: null, body: null, isBase64Encoded: false,
    requestContext: { stage: 'test', httpMethod: method, path, identity: { sourceIp: '127.0.0.1' } },
  };
}

const compose = (...args) =>
  sh('docker', ['compose', '-f', join(HERE, 'docker-compose.yml'), ...args], { stdio: 'inherit' });

async function waitForHealth(timeoutMs = 120000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(`${ENDPOINT}/_localstack/health`);
      const body = await res.json();
      const s = body.services || {};
      if (['lambda', 's3', 'apigateway'].every((k) => ['available', 'running'].includes(s[k]))) return;
    } catch {}
    await sleep(2000);
  }
  throw new Error('LocalStack did not become healthy in time');
}

// Build a Lambda deployment zip from the packed tarball + a handler dir.
function buildZip(label, tgz, handlerDir, deps = []) {
  const root = makeInstallRoot(`ls-${label}`, tgz, deps);
  cpSync(handlerDir, root, { recursive: true });
  return zipDir(root);
}

async function main() {
  const { LambdaClient, CreateFunctionCommand, InvokeCommand, GetFunctionConfigurationCommand } =
    await import('@aws-sdk/client-lambda');
  const { S3Client, CreateBucketCommand, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const lambda = new LambdaClient({ endpoint: ENDPOINT, region: REGION, credentials: CREDS });
  const s3 = new S3Client({ endpoint: ENDPOINT, region: REGION, credentials: CREDS, forcePathStyle: true });

  console.log('lambda-api e2e — Layer 2 (LocalStack)\nbuilding deployment packages…');
  const tgz = packTarball();

  // esbuild-bundle the ESM handler to a single index.mjs (the #295 proof), aws-sdk external.
  const bundleDir = mkdtempSync(join(tmpdir(), 'ls-esbuild-'));
  const esmRoot = makeInstallRoot('ls-esbuild-src', tgz, ['esbuild@^0.25.0']);
  cpSync(join(HANDLERS, 'esm', 'handler.mjs'), join(esmRoot, 'handler.mjs'));
  sh(join(esmRoot, 'node_modules', '.bin', 'esbuild'), [
    'handler.mjs', '--bundle', '--format=esm', '--platform=node', '--external:@aws-sdk/*',
    `--outfile=${join(bundleDir, 'index.mjs')}`,
  ], { cwd: esmRoot });

  const AWS_DEPS = ['@aws-sdk/client-s3@^3.470.0', '@aws-sdk/s3-request-presigner@^3.470.0'];
  const fns = [
    { name: 'e2e-cjs', handler: 'handler.handler', zip: () => buildZip('cjs', tgz, join(HANDLERS, 'cjs')) },
    { name: 'e2e-esm', handler: 'handler.handler', zip: () => buildZip('esm', tgz, join(HANDLERS, 'esm')) },
    { name: 'e2e-esbuild-esm', handler: 'index.handler', zip: () => zipDir(bundleDir) },
    { name: 'e2e-s3', handler: 'handler.handler', env: { E2E_BUCKET: BUCKET }, zip: () => buildZip('s3', tgz, join(HANDLERS, 's3'), AWS_DEPS) },
  ];

  console.log('starting LocalStack…');
  compose('up', '-d');
  try {
    await waitForHealth();
    console.log('LocalStack healthy.\n');

    // S3 bucket + object for the S3 path
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: 'hello.txt', Body: 'hello from s3', ContentType: 'text/plain' }));

    console.log('deploying functions…');
    for (const fn of fns) {
      await lambda.send(new CreateFunctionCommand({
        FunctionName: fn.name, Runtime: RUNTIME, Role: ROLE, Handler: fn.handler,
        Code: { ZipFile: fn.zip() }, Timeout: 30, MemorySize: 256,
        Environment: fn.env ? { Variables: fn.env } : undefined,
      }));
    }
    // wait for all Active
    for (const fn of fns) {
      for (let i = 0; i < 45; i++) {
        const cfg = await lambda.send(new GetFunctionConfigurationCommand({ FunctionName: fn.name }));
        if (cfg.State === 'Active') break;
        if (cfg.State === 'Failed') throw new Error(`${fn.name} failed to provision: ${cfg.StateReason}`);
        await sleep(1000);
      }
    }
    console.log('deployed.\n');

    const invoke = async (name, event) => {
      const res = await lambda.send(new InvokeCommand({
        FunctionName: name, Payload: Buffer.from(JSON.stringify(event)), LogType: 'Tail',
      }));
      const payload = res.Payload ? JSON.parse(Buffer.from(res.Payload).toString()) : null;
      const logs = res.LogResult ? Buffer.from(res.LogResult, 'base64').toString() : '';
      return { payload, logs, functionError: res.FunctionError };
    };

    console.log('▸ real Lambda runtime invocations');
    await check('cjs function: GET / -> 200 {hello:world}', async () => {
      const { payload, functionError } = await invoke('e2e-cjs', apiGatewayV1('/'));
      assert(!functionError, `FunctionError: ${JSON.stringify(payload)}`);
      assert(payload.statusCode === 200 && JSON.parse(payload.body).hello === 'world', `resp: ${JSON.stringify(payload)}`);
    });
    await check('esm function: GET / -> 200 {hello:world}', async () => {
      const { payload, functionError } = await invoke('e2e-esm', apiGatewayV1('/'));
      assert(!functionError, `FunctionError: ${JSON.stringify(payload)}`);
      assert(payload.statusCode === 200 && JSON.parse(payload.body).hello === 'world', `resp: ${JSON.stringify(payload)}`);
    });
    await check('esbuild .mjs bundle: loads clean (issue #295) -> 200', async () => {
      const { payload, logs, functionError } = await invoke('e2e-esbuild-esm', apiGatewayV1('/'));
      assert(!/Dynamic require of/.test(logs), 'log contains "Dynamic require of ..." (#295 regression)');
      assert(!functionError, `FunctionError: ${JSON.stringify(payload)}\n${logs}`);
      assert(payload.statusCode === 200 && JSON.parse(payload.body).hello === 'world', `resp: ${JSON.stringify(payload)}`);
    });

    console.log('▸ S3 path against real (LocalStack) S3');
    await check('s3 function: GET /s3link -> presigned URL', async () => {
      const { payload, functionError } = await invoke('e2e-s3', apiGatewayV1('/s3link'));
      assert(!functionError, `FunctionError: ${JSON.stringify(payload)}`);
      assert(payload.statusCode === 200, `status ${payload?.statusCode}: ${payload?.body}`);
      assert(JSON.parse(payload.body).url.includes(BUCKET), 'url missing bucket');
    });
    await check('s3 function: GET /s3file -> returns object body "hello from s3"', async () => {
      const { payload, functionError } = await invoke('e2e-s3', apiGatewayV1('/s3file'));
      assert(!functionError, `FunctionError: ${JSON.stringify(payload)}`);
      assert(payload.statusCode === 200, `status ${payload?.statusCode}: ${payload?.body}`);
      const body = payload.isBase64Encoded ? Buffer.from(payload.body, 'base64').toString() : payload.body;
      assert(body.includes('hello from s3'), `body: ${body}`);
    });

    await runApiGateway(lambda, apiGatewayV1);

  } finally {
    console.log('\ntearing down LocalStack…');
    try { compose('down', '-v'); } catch {}
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${'='.repeat(60)}\nLayer 2: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) { for (const f of failed) console.log(`  - ${f.desc}\n      ${f.err}`); process.exit(1); }
}

// Full API Gateway -> Lambda HTTP path for the cjs function.
async function runApiGateway(lambda, apiGatewayV1) {
  const {
    APIGatewayClient, CreateRestApiCommand, GetResourcesCommand, CreateResourceCommand,
    PutMethodCommand, PutIntegrationCommand, CreateDeploymentCommand,
  } = await import('@aws-sdk/client-api-gateway');
  const apigw = new APIGatewayClient({ endpoint: ENDPOINT, region: REGION, credentials: CREDS });

  console.log('▸ API Gateway -> Lambda HTTP path');
  await check('REST API proxies GET / to the cjs Lambda -> 200', async () => {
    const api = await apigw.send(new CreateRestApiCommand({ name: 'e2e-api' }));
    const roots = await apigw.send(new GetResourcesCommand({ restApiId: api.id }));
    const rootId = roots.items.find((r) => r.path === '/').id;
    const proxy = await apigw.send(new CreateResourceCommand({ restApiId: api.id, parentId: rootId, pathPart: '{proxy+}' }));
    for (const resourceId of [rootId, proxy.id]) {
      await apigw.send(new PutMethodCommand({ restApiId: api.id, resourceId, httpMethod: 'ANY', authorizationType: 'NONE' }));
      await apigw.send(new PutIntegrationCommand({
        restApiId: api.id, resourceId, httpMethod: 'ANY', type: 'AWS_PROXY', integrationHttpMethod: 'POST',
        uri: `arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:000000000000:function:e2e-cjs/invocations`,
      }));
    }
    await apigw.send(new CreateDeploymentCommand({ restApiId: api.id, stageName: 'test' }));
    const url = `${ENDPOINT}/restapis/${api.id}/test/_user_request_/`;
    const res = await fetch(url);
    const text = await res.text();
    assert(res.status === 200, `http ${res.status}: ${text}`);
    assert(JSON.parse(text).hello === 'world', `body: ${text}`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
