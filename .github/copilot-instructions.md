# GitHub Copilot Instructions for lambda-api

This repository contains **lambda-api**, a lightweight web framework for AWS Lambda serverless applications. This framework has **ZERO dependencies** and is designed specifically for serverless applications using AWS Lambda and API Gateway.

## Project Overview

Lambda API is a web framework that closely mirrors Express.js and Fastify but is significantly stripped down to maximize performance with Lambda's stateless, single-run executions. It provides routing, HTML serving, redirects, binary file serving, middleware, error handling, and more.

## Architecture & Code Structure

- **`index.js`** - Main API class and entry point
- **`lib/`** - Core library modules:
  - `request.js` - Request handling and parsing
  - `response.js` - Response formatting and methods
  - `utils.js` - Utility functions
  - `logger.js` - Built-in logging engine
  - `errors.js` - Custom error classes
  - `compression.js` - Response compression handling
  - `s3-service.js` - S3 integration for file operations
  - `statusCodes.js` - HTTP status code mappings
  - `mimemap.js` - MIME type mappings
  - `prettyPrint.js` - Route debugging and visualization
- **`__tests__/`** - Jest unit tests for all functionality
- **`index.d.ts`** - TypeScript type definitions

## Development Guidelines

### Code Style & Conventions

- **Style**: Use JavaScript ES6+ features, strict mode (`'use strict'`)
- **Quotes**: Single quotes for strings (enforced by Prettier)
- **Code quality**: ESLint with `eslint:recommended` and Prettier integration
- **Comments**: Use JSDoc style for file headers with author and license
- **Error handling**: Use custom error classes from `lib/errors.js` (ConfigurationError, ApiError, FileError)
- **Async patterns**: Support both async/await and Promises
- **No external dependencies**: This is a core principle - do not add external npm packages

### Testing

- **Framework**: Jest
- **Test files**: `__tests__/*.unit.js`
- **Test structure**: Each module has corresponding unit tests
- **Coverage**: Aim for high test coverage
- **Run tests**: `npm test` (runs both type tests and unit tests)
  - Type tests: `npm run test:types`
  - Unit tests only: `npm run test:unit`
  - With coverage: `npm run test-cov`

### Build & Development Commands

```bash
# Install dependencies
npm ci

# Run all tests (TypeScript types + Jest unit tests)
npm test

# Linting
npm run lint:check      # Check for lint errors
npm run lint:fix        # Auto-fix lint errors

# Code formatting
npm run prettier:check  # Check formatting
npm run prettier:write  # Auto-format code

# CI test command (includes linting, formatting, tests, and coverage)
npm run test-ci
```

### Key Features & Patterns

1. **Route definition**: Similar to Express.js

   ```javascript
   api.get('/path', async (req, res) => {
     return { status: 'ok' };
   });
   ```

2. **Middleware support**: Method-based and global middleware
3. **Error handling**: Built-in error middleware system
4. **Binary support**: Automatic base64 encoding/decoding
5. **Compression**: Built-in gzip/brotli compression
6. **S3 integration**: Pre-signed URL generation via `getLink()`
7. **Logger**: Configurable logging with sampling support
8. **Multi-version support**: API Gateway v1/v2 and ALB payload formats

### AWS Integration

- Designed for AWS Lambda Proxy Integration and ALB Lambda Target Support
- Parses API Gateway and ALB event formats (v1 and v2)
- Automatically handles request parsing and response formatting
- Supports binary file uploads/downloads via base64 encoding

### TypeScript Support

- Type definitions in `index.d.ts`
- Type tests in `index.test-d.ts` using `tsd`
- Ensure changes maintain TypeScript compatibility

### Making Changes

1. **Minimal dependencies**: Never add external npm dependencies without strong justification
2. **Test coverage**: Add unit tests for new features in `__tests__/`
3. **Type definitions**: Update `index.d.ts` for public API changes
4. **Documentation**: Update README.md for user-facing changes
5. **Backwards compatibility**: Avoid breaking changes when possible
6. **Performance**: Keep the framework lightweight and fast
7. **Serverless-first**: Design with Lambda's stateless execution model in mind

### Security Considerations

- Validate all user inputs
- Sanitize HTML output (use `escapeHtml` from `lib/utils.js`)
- Be cautious with file operations and S3 integrations
- Ensure proper error handling to avoid information leakage
- Use secure defaults for cookies and headers

### Common Patterns

- **Route handlers**: Accept `(req, res, next)` parameters
- **Async responses**: Can return values directly or use `res.send()`, `res.json()`, etc.
- **Error propagation**: Use `res.error()` or throw errors to trigger error middleware
- **Path parameters**: Extracted automatically (e.g., `/user/:id`)
- **Middleware chaining**: Use `next()` to continue to next middleware/handler

### CI/CD

- GitHub Actions workflows in `.github/workflows/`
- Automated testing on push to main branch
- Coverage reports sent to Coveralls
- Requires Node.js 14+ (currently testing on 14.x)

## Notes for Copilot

- This is a production library used by many serverless applications
- Prioritize backwards compatibility and stability
- Keep the codebase simple and maintainable
- Performance is critical - avoid adding overhead
- The zero-dependency philosophy is non-negotiable
- When suggesting changes, ensure they align with Express.js-like API patterns
- Test thoroughly with both API Gateway v1/v2 and ALB event formats
