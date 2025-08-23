# Lambda API

Lambda API is a lightweight web framework for AWS Lambda using AWS API Gateway Lambda Proxy Integration or ALB Lambda Target Support. It has **zero dependencies** and is designed specifically for serverless applications.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

- Install dependencies:
  - `npm ci` -- takes 35 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
- Run all tests:
  - `npm test` -- runs TypeScript tests + Jest unit tests, takes 12 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
  - `npm run test:unit` -- runs Jest unit tests only, takes 6 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
  - `npm run test:types` -- runs TypeScript definition tests, takes 4 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
  - `npm run test-cov` -- runs unit tests with coverage, takes 8 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
- Linting and formatting:
  - `npm run lint:check` -- runs ESLint, takes <1 second
  - `npm run lint:fix` -- auto-fixes ESLint issues
  - `npm run prettier:check` -- checks Prettier formatting, takes <1 second
  - `npm run prettier:write` -- auto-formats with Prettier
- CI validation:
  - `npm run test-ci` -- runs lint + prettier + coverage tests (what CI runs)
    - Note: May fail on Coveralls upload due to network limitations, but tests pass

## Key Project Information

- **No build step required** - this is pure JavaScript, not compiled
- **Zero dependencies** - this is a core design principle
- **Main entry point**: `index.js` - contains the main API class
- **Library code**: `lib/` directory - request, response, utils, middleware, etc.
- **TypeScript support**: `index.d.ts` - type definitions included
- **Test coverage**: 97.63% with 478 tests across 27 test suites

## Validation

- Always manually validate Lambda API changes by creating a test script and running real scenarios:
  ```javascript
  const api = require('./index.js')();
  api.get('/test', (req, res) => res.json({ status: 'ok' }));
  const mockEvent = {
    httpMethod: 'GET',
    path: '/test',
    body: null,
    headers: {},
    multiValueHeaders: {},
  };
  api.run(mockEvent, {}).then((result) => console.log(result));
  ```
- ALWAYS run through at least one complete end-to-end scenario after making changes
- Test scenarios to validate after changes:
  - Basic route creation and JSON response: `api.get('/test', (req, res) => res.json({ status: 'ok' }))`
  - Path parameters: `api.get('/users/:id', (req, res) => res.json({ id: req.params.id }))`
  - Different HTTP methods: GET, POST, PUT, DELETE
  - Middleware functionality: `api.use((req, res, next) => { /* middleware logic */ next(); })`
  - Error handling: `api.get('/error', (req, res) => res.error(500, 'Test error'))`
  - Request/response processing with real event objects
- Use `api.routes(true)` to debug and display all defined routes in table format
- Always run `npm run lint:check` and `npm run prettier:check` before committing or the CI will fail

## Common Tasks

The following are outputs from frequently run commands. Reference them instead of viewing, searching, or running bash commands to save time.

### Repository Structure

```
/home/runner/work/lambda-api/lambda-api/
├── index.js              # Main API class
├── index.d.ts           # TypeScript definitions
├── package.json         # Dependencies and scripts
├── lib/                 # Core library modules
│   ├── request.js       # Request handling
│   ├── response.js      # Response handling
│   ├── utils.js         # Utility functions
│   ├── logger.js        # Built-in logging
│   ├── middleware.js    # Middleware system
│   ├── errors.js        # Error handling
│   └── s3-service.js    # S3 integration
├── __tests__/           # Jest test suites (27 files)
├── .github/workflows/   # GitHub Actions CI
├── .eslintrc.json       # ESLint configuration
└── .prettierrc.json     # Prettier configuration
```

### Package.json Scripts

```json
{
  "test": "tsd && jest unit",
  "test:types": "tsd",
  "test:unit": "jest unit",
  "lint:check": "eslint .",
  "lint:fix": "eslint . --fix",
  "prettier:check": "prettier --check .",
  "prettier:write": "prettier --write .",
  "test-cov": "jest unit --coverage",
  "test-ci": "npm run lint:check && npm run prettier:check && jest unit --coverage"
}
```

### Example API Usage

```javascript
// Basic Lambda API setup
const api = require('./index.js')();

// Define routes
api.get('/', (req, res) => res.json({ status: 'ok' }));
api.get('/users/:id', (req, res) => res.json({ user: { id: req.params.id } }));
api.post('/users', (req, res) =>
  res.status(201).json({ created: true, user: req.body })
);

// Add middleware
api.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error handling
api.get('/error', (req, res) => res.error(500, 'Something went wrong'));

// Debug routes
api.routes(true); // Displays routes in table format

// Lambda handler
exports.handler = async (event, context) => {
  return await api.run(event, context);
};
```

### Test Suite Structure

- **27 test suites** covering all functionality
- **478 tests** with 4 skipped tests
- **Key test files**:
  - `run.unit.js` - Main API execution tests
  - `routes.unit.js` - Route definition and matching
  - `requests.unit.js` - Request parsing and handling
  - `responses.unit.js` - Response formatting
  - `middleware.unit.js` - Middleware functionality
  - `errorHandling.unit.js` - Error handling scenarios

### CI Pipeline (.github/workflows/build.yml)

- Runs on Node.js 14.x
- Executes `npm run test-ci` which includes:
  - ESLint checking
  - Prettier formatting validation
  - Jest unit tests with coverage
  - Coverage reporting to Coveralls

## Architecture Notes

- **Framework Type**: Express.js-like API for AWS Lambda
- **Key Features**: Routing, middleware, error handling, logging, binary support, CORS, compression
- **AWS Integration**: API Gateway Proxy Integration and ALB Lambda Target Support
- **Performance**: Optimized for Lambda cold starts with zero dependencies
- **Request Flow**: API Gateway/ALB → Lambda → Lambda API → Your handlers → Response

## Common Patterns

When working with lambda-api:

- Always check the `__tests__/` directory for examples of how to use features
- Route handlers receive `(req, res)` parameters similar to Express.js
- Use `res.json()`, `res.send()`, `res.error()` for responses
- Path parameters are available via `req.params.paramName`
- Query parameters via `req.query`
- Request body via `req.body`
- Headers via `req.headers`
- Middleware is added with `api.use(middleware)` and called with `next()`
