'use strict';

/**
 * Express (via @vendia/serverless-express) adapter for the benchmark suite.
 *
 * Represents the common "port my Express app to Lambda" path. Configured minimally —
 * only the JSON body parser middleware — to keep the comparison fair.
 */

const express = require('express');
const serverlessExpress = require('@vendia/serverless-express');
const pkg = require('express/package.json');
const { ROUTE_COUNT } = require('../lib/scenarios');

function build() {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => res.json({ hello: 'world' }));
  app.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
  app.post('/users', (req, res) => res.json({ created: req.body }));

  for (let i = 0; i < ROUTE_COUNT; i++) {
    const index = i;
    app.get(`/r${i}/:p`, (req, res) => res.json({ i: index }));
  }

  // Explicit 404 — every Express-on-Lambda app needs one, and it keeps unmatched routes off
  // Express's finalhandler path, which `on-finished` can't attach to serverless-express's
  // mock socket (it would otherwise 500). Mirrors the built-in 404 of the other frameworks.
  app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

  const handler = serverlessExpress({ app });

  // @vendia/serverless-express v4 returns a promise when invoked without a callback.
  return (event, context) => handler(event, context);
}

module.exports = { name: 'serverless-express', version: pkg.version, build };
