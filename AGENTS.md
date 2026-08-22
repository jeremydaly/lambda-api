# AGENTS.md

Lightweight web framework for AWS Lambda with **zero external dependencies**. Express.js-like API for serverless apps, supporting API Gateway v1/v2 and ALB event formats.

## Commands

```bash
npm test                                        # Type tests (tsd) + Jest unit tests
npm run test:unit                               # Jest unit tests only
npx jest __tests__/routes.unit.js               # Run a single test file
npm run test:types                              # TypeScript definition tests (tsd)
npm run test-cov                                # Jest with coverage
npm run test-ci                                 # Full CI: lint + format + tests + coverage
npm run lint:check                              # ESLint check
npm run lint:fix                                # ESLint auto-fix
npm run prettier:check                          # Prettier check
npm run prettier:write                          # Prettier auto-fix
```

## Architecture

**Entry point**: `index.js` — main `API` class. Handles route registration, middleware management, and the `run()` method that processes Lambda events.

**Core modules** in `lib/`:

- `request.js` — Parses Lambda event into Express-like request object (headers, query, params, body, auth)
- `response.js` — Response builder: `json()`, `html()`, `send()`, `redirect()`, `sendFile()`, `cookie()`, `cors()`
- `utils.js` — Path parsing, URL encoding, HTML escaping, MIME lookup, body parsing
- `logger.js` — Built-in logging with sampling, custom levels, and serializers
- `errors.js` — Custom error classes: `RouteError`, `MethodError`, `ConfigurationError`, `ApiError`, `FileError`, `ResponseError`
- `compression.js` — Brotli/Gzip/Deflate response compression
- `s3-service.js` — S3 file operations and pre-signed URLs (peer deps: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)

**Request/response flow**: Lambda event → `REQUEST` parses event → execution stack built from matched routes + middleware → handlers run sequentially via `next()` → `RESPONSE` formats output for API Gateway/ALB.

**Routing internals**: Routes stored in a hierarchical tree (`_routes` object). Path parameters become `__VAR__` markers. Wildcard routes (`/*`) supported. Execution stacks are method-specific with middleware inheritance.

**Type definitions**: `index.d.ts` with type tests in `index.test-d.ts` (validated via `tsd`).

## Code Style

- JavaScript ES6+ with `'use strict'`
- Single quotes, enforced by Prettier
- ESLint with `eslint:recommended` + `prettier`
- JSDoc file headers with author and license
- Use custom error classes from `lib/errors.js`, not raw `Error`

Example handler pattern:

```javascript
// Route handler
api.get('/users/:id', async (req, res) => {
  return { id: req.params.id };
});

// Error middleware (4 params)
api.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

## Build

`src/` is **pure ESM** and is compiled twice by SWC — to `dist/cjs` and to `dist/esm`. The
CommonJS interop that makes `require('lambda-api')` callable is appended to the CJS artifact
_only_, by `scripts/cjs-interop.js`.

Never put a `module.exports` / `typeof module` write in `src/`. It would also land in `dist/esm`,
and bundlers that inline the ESM artifact into a generated CommonJS wrapper (esbuild
`--format=cjs`, AWS CDK `NodejsFunction`, SST, Serverless) execute it against the _consumer's_
`module`, wiping out their exports — on Lambda that reads as `Runtime.HandlerNotFound`
(issue #346). `__tests__/module-compat.unit.js` fails the build if one reappears.

The footer is derived per file, not enumerated: a module whose only export is `default` collapses
to that value, a module with named exports is left as SWC emitted it, and a module with both fails
the build until you add an explicit entry to `EXCEPTIONS` in `scripts/cjs-interop.js`. New files
are covered automatically.

## Testing

- Tests live in `__tests__/*.unit.js`
- Sample Lambda events in `__tests__/sample-*.json`
- Always test with API Gateway v1, v2, and ALB event formats
- Update type definitions in `index.d.ts` for public API changes, then run `npm run test:types`

## Boundaries

**Never do:**

- Add external npm dependencies (zero-dependency policy is non-negotiable)
- Introduce breaking changes to the public API
- Write to `module.exports` or `exports` from `src/` — see Build below

**Always do:**

- Add unit tests in `__tests__/*.unit.js` for new features
- Update `index.d.ts` when changing the public API
- Maintain backwards compatibility
