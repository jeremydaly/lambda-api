'use strict';

/**
 * Middy (@middy/core) adapter for the benchmark suite.
 *
 * Middy is a middleware engine, not a router, so a fair comparison adds the official
 * http-router (routing + path params), http-json-body-parser (the POST body), and
 * http-error-handler (the 404). These packages are ESM-only, so they are loaded through a
 * dynamic import() inside an async build() — the runner awaits build().
 */

const fs = require('fs');
const path = require('path');
const { ROUTE_COUNT } = require('../lib/scenarios');

function middyVersion() {
  try {
    const pkgPath = path.join(__dirname, '..', 'node_modules', '@middy', 'core', 'package.json');
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  } catch (err) {
    return 'unknown';
  }
}

async function build() {
  const middy = (await import('@middy/core')).default;
  const httpRouterHandler = (await import('@middy/http-router')).default;
  const httpJsonBodyParser = (await import('@middy/http-json-body-parser')).default;
  const httpErrorHandler = (await import('@middy/http-error-handler')).default;

  const json = (statusCode, payload) => ({ statusCode, body: JSON.stringify(payload) });

  const routes = [
    { method: 'GET', path: '/', handler: async () => json(200, { hello: 'world' }) },
    {
      method: 'GET',
      path: '/users/{id}',
      handler: async (event) => json(200, { id: event.pathParameters.id })
    },
    {
      method: 'POST',
      path: '/users',
      handler: middy(async (event) => json(200, { created: event.body })).use(httpJsonBodyParser())
    }
  ];

  for (let i = 0; i < ROUTE_COUNT; i++) {
    const index = i;
    routes.push({ method: 'GET', path: `/r${i}/{p}`, handler: async () => json(200, { i: index }) });
  }

  // logger:false — http-router throws a 404 for unmatched routes; without this the
  // not-found scenario would spam stderr on every timed iteration.
  const handler = middy(httpRouterHandler(routes)).use(httpErrorHandler({ logger: false }));

  return (event, context) => handler(event, context);
}

module.exports = { name: 'middy', version: middyVersion(), build };
