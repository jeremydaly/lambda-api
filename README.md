<p align="center">
  <a href="https://jeremydaly.github.io/lambda-api/">
    <img src="assets/lambda-api-logo.png" alt="Lambda API" width="300" />
  </a>
</p>

<p align="center">
  <b>Lightweight web framework for your serverless applications</b>
</p>

<p align="center">
  <a href="https://github.com/jeremydaly/lambda-api/actions/workflows/build.yml"><img src="https://github.com/jeremydaly/lambda-api/actions/workflows/build.yml/badge.svg?branch=main" alt="Build Status" /></a>
  <a href="https://www.npmjs.com/package/lambda-api"><img src="https://img.shields.io/npm/v/lambda-api.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/lambda-api"><img src="https://img.shields.io/npm/l/lambda-api.svg" alt="License" /></a>
  <a href="https://coveralls.io/github/jeremydaly/lambda-api?branch=main"><img src="https://coveralls.io/repos/github/jeremydaly/lambda-api/badge.svg?branch=main" alt="Coverage Status" /></a>
</p>

---

Lambda API is a lightweight web framework for AWS Lambda using AWS API Gateway Lambda Proxy Integration or ALB Lambda Target Support. This closely mirrors (and is based on) other web frameworks like Express.js and Fastify, but is significantly stripped down to maximize performance with Lambda's stateless, single run executions.

## 📚 Documentation

**Full documentation — guides, the complete API reference, and examples — lives on the docs site:**

### 👉 https://jeremydaly.github.io/lambda-api/

The documentation used to live inline in this README, which had grown unwieldy. It now has a dedicated, searchable [Docusaurus](https://docusaurus.io/) site (this closes [#27](https://github.com/jeremydaly/lambda-api/issues/27)).

| Section                                                                                                       | What's covered                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Getting Started](https://jeremydaly.github.io/lambda-api/docs/getting-started/introduction)                  | Installation, requirements, quick start                                                    |
| [Core Concepts](https://jeremydaly.github.io/lambda-api/docs/core-concepts/routes-and-methods)                | Routing, responses, prefixing, path params, wildcards, namespaces, execution stacks        |
| [Request & Response](https://jeremydaly.github.io/lambda-api/docs/request-response/request-object)            | The REQUEST object, sending responses, headers & cookies, redirects & CORS, caching, files |
| [Middleware & Errors](https://jeremydaly.github.io/lambda-api/docs/middleware-errors/middleware)              | Global/path/method middleware, clean up, error handling                                    |
| [Logging](https://jeremydaly.github.io/lambda-api/docs/logging/overview)                                      | Levels, format, serializers, sampling                                                      |
| [Deployment & Integrations](https://jeremydaly.github.io/lambda-api/docs/deployment/lambda-proxy-integration) | API Gateway v1/v2, ALB, compression, CORS                                                  |
| [TypeScript Support](https://jeremydaly.github.io/lambda-api/docs/typescript/typescript-support)              | Bundled type definitions                                                                   |

## Installation

```
npm i lambda-api --save
```

> **Using AWS SDK v2?** `lambda-api@v1` uses AWS SDK v3. If you are using AWS SDK v2, please use `lambda-api@v0.12.0`.

Releases are published to npm via GitHub Actions using [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers), so every published version ships with [npm provenance](https://docs.npmjs.com/generating-provenance-statements).

## Quick Example

```javascript
// Require the framework and instantiate it
const api = require('lambda-api')();

// Define a route
api.get('/status', async (req, res) => {
  return { status: 'ok' };
});

// Declare your Lambda handler
exports.handler = async (event, context) => {
  // Run the request
  return await api.run(event, context);
};
```

Head to the [Quick Start guide](https://jeremydaly.github.io/lambda-api/docs/getting-started/quick-start) for a TypeScript version and a full walkthrough.

## Requirements

- AWS Lambda running **Node 8.10+**
- AWS API Gateway using [Proxy Integration](https://jeremydaly.github.io/lambda-api/docs/deployment/lambda-proxy-integration), or an ALB Lambda target

## Why Lambda API?

Express.js has **30 dependencies**, Fastify has **12**, and Hapi has **17**. Lambda API has **ZERO**. It was written to be _extremely lightweight_ and built specifically for **serverless** applications, giving you routing, middleware, a powerful logging engine, binary/file support, and automatic API Gateway/ALB handling with virtually no impact on cold-start performance. Read more in [the introduction](https://jeremydaly.github.io/lambda-api/docs/getting-started/introduction).

## Contributing

Contributions, ideas and bug reports are welcome and greatly appreciated. Please add [issues](https://github.com/jeremydaly/lambda-api/issues) for suggestions and bug reports or create a pull request. Docs content lives in [`website/docs`](website/docs) — see [`website/README.md`](website/README.md) for how to run the site locally.

## License

[MIT](LICENSE)
