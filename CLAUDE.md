# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

lambda-api is a lightweight web framework for AWS Lambda with **zero external dependencies** (non-negotiable). It provides an Express.js-like API for serverless applications, supporting API Gateway v1/v2 and ALB event formats.

## Commands

```bash
npm test                    # Type tests (tsd) + Jest unit tests
npm run test:unit           # Jest unit tests only
npm run test:unit -- __tests__/routes.unit.js  # Run a single test file
npm run test:types          # TypeScript definition tests (tsd)
npm run test-cov            # Jest with coverage
npm run test-ci             # Full CI: lint + format + tests + coverage
npm run lint:check          # ESLint check
npm run lint:fix            # ESLint auto-fix
npm run prettier:check      # Prettier check
npm run prettier:write      # Prettier auto-fix
```

## Architecture

**Entry point**: `index.js` — the main `API` class (~1000 lines). Handles route registration, middleware management, and the `run()` method that processes Lambda events.

**Core modules** in `lib/`:
- `request.js` — Parses Lambda event into Express-like request object (headers, query, params, body, auth)
- `response.js` — Response builder with methods like `json()`, `html()`, `send()`, `redirect()`, `sendFile()`, `cookie()`, `cors()`
- `utils.js` — Path parsing, URL encoding, HTML escaping, MIME lookup, body parsing
- `logger.js` — Built-in logging with sampling, custom levels, and serializers
- `errors.js` — Custom error classes: `RouteError`, `MethodError`, `ConfigurationError`, `ApiError`, `FileError`, `ResponseError`
- `compression.js` — Brotli/Gzip/Deflate response compression
- `s3-service.js` — S3 file operations and pre-signed URLs (uses `@aws-sdk/client-s3` as peer dep)

**Request/response flow**: Lambda event → `REQUEST` class parses event → execution stack built from matched routes + middleware → handlers run sequentially via `next()` → `RESPONSE` class formats output for API Gateway/ALB.

**Routing internals**: Routes stored in a hierarchical tree (`_routes` object). Path parameters become `__VAR__` markers. Wildcard routes (`/*`) supported. Execution stacks are method-specific with middleware inheritance.

**Type definitions**: `index.d.ts` with type tests in `index.test-d.ts` (validated via `tsd`).

## Code Conventions

- JavaScript ES6+ with `'use strict'`
- Single quotes (Prettier), no semicolons not enforced
- ESLint with `eslint:recommended` + `prettier`
- JSDoc file headers with author and license
- Custom error classes from `lib/errors.js` — use these, not raw Error
- Handlers accept `(req, res, next)`, error middleware uses `(err, req, res, next)`

## Making Changes

- Never add external npm dependencies
- Add unit tests in `__tests__/*.unit.js` for new features
- Update `index.d.ts` for public API changes
- Test with API Gateway v1, v2, and ALB event formats (sample events in `__tests__/sample-*.json`)
- Maintain backwards compatibility
