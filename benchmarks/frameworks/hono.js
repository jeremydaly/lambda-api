'use strict';

/**
 * Hono (via hono/aws-lambda) adapter for the benchmark suite.
 *
 * Hono ships as ESM-only, so it is loaded through a dynamic import() inside an async
 * build() — keeping the rest of the suite plain CommonJS. The runner awaits build().
 *
 * @author Benchmark suite for lambda-api (issue #34)
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const { ROUTE_COUNT } = require('../lib/scenarios');

// hono's `exports` map blocks `require('hono/package.json')`, so read it from disk directly.
function honoVersion() {
  try {
    const pkgPath = path.join(__dirname, '..', 'node_modules', 'hono', 'package.json');
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  } catch (err) {
    return 'unknown';
  }
}

async function build() {
  const { Hono } = await import('hono');
  const { handle } = await import('hono/aws-lambda');

  const app = new Hono();

  app.get('/', (c) => c.json({ hello: 'world' }));
  app.get('/users/:id', (c) => c.json({ id: c.req.param('id') }));
  app.post('/users', async (c) => c.json({ created: await c.req.json() }));

  for (let i = 0; i < ROUTE_COUNT; i++) {
    const index = i;
    app.get(`/r${i}/:p`, (c) => c.json({ i: index }));
  }

  const handler = handle(app);
  return (event, context) => handler(event, context);
}

module.exports = { name: 'hono', version: honoVersion(), build };
