# lambda-api dual-package e2e suite

End-to-end validation that the published **dual CJS/ESM** package actually works for real
consumers and on the real AWS Lambda runtime. Unlike the in-repo `__tests__/module-compat`
tests (which load `dist/` directly with the optional AWS SDK present), this suite installs the
**packed tarball** into isolated consumer projects, honoring the published `exports` map and
`files` whitelist — the shape users actually get from npm.

It is excluded from the npm tarball by the root `package.json` `files` whitelist.

## What it proves

- `require('lambda-api')` and `import 'lambda-api'` load and serve **without** the optional
  `@aws-sdk/*` peer deps installed (the SDK is lazy — issue #290).
- **Issue #295**: bundling a handler to ESM `.mjs` with esbuild no longer throws
  `Dynamic require of "querystring" is not supported` at load / Lambda cold start.
- Deep imports (`lambda-api/lib/*`), the `exports` subpath map (incl. `package.json`), and
  TypeScript `node16` module resolution + types.
- The S3 path (`getLink` presign, `sendFile` GetObject) still works after the lazy-SDK refactor,
  against real S3.

## Layer 1 — fast, no Docker

```bash
npm run test:e2e
```

Packs the tarball, installs it into isolated temp roots (with and without `@aws-sdk/*`), and
runs each fixture in `e2e/fixtures/` in its own child process with synthetic API Gateway events.
No Docker required; suitable for CI on a Node 18/20/22 matrix.

## Layer 2 — LocalStack (real Lambda runtime + real S3 + API Gateway)

```bash
cd e2e/localstack && npm install   # one-time: installs the AWS SDK clients used to drive it
npm run test:e2e:localstack        # from the repo root
```

Requires **Docker**. Brings up `localstack/localstack` via `docker-compose.yml`, deploys the
handler variants (CJS, ESM, an esbuild-bundled `.mjs`, and an S3 handler) as Lambda functions on
`nodejs20.x`, then invokes them directly and through a real API Gateway REST API, asserting
responses and checking logs for the #295 `Dynamic require` error. LocalStack executes functions
in the actual AWS Lambda Node runtime containers, so a passing run is the authoritative proof the
package loads clean at cold start. The suite tears LocalStack down when done.

## Layout

```
e2e/
  run-layer1.mjs            # Layer 1 orchestrator (no Docker)
  helpers/harness.mjs       # pack tarball, isolated installs, child-process runner, assertions
  fixtures/                 # consumer apps: cjs, esm, deep-import-*, s3, typescript
  localstack/
    docker-compose.yml      # LocalStack service
    package.json            # AWS SDK clients that drive LocalStack
    run-all.mjs             # deploy + invoke + assert + teardown
    handlers/               # Lambda handler variants deployed to LocalStack
```

## Adding a case

Add a fixture directory under `e2e/fixtures/<name>/` (a `package.json` + handler that reads an
event path from `process.argv[2]` and writes the response JSON to stdout), then wire a check in
`run-layer1.mjs`. For a real-runtime case, add a handler under `localstack/handlers/` and a
function entry in `localstack/run-all.mjs`.
