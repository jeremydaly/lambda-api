'use strict';

/**
 * Fastify (via @fastify/aws-lambda) adapter for the benchmark suite.
 */

const Fastify = require('fastify');
const awsLambdaFastify = require('@fastify/aws-lambda');
const pkg = require('fastify/package.json');
const { ROUTE_COUNT } = require('../lib/scenarios');

async function build() {
  const app = Fastify();

  app.get('/', async () => ({ hello: 'world' }));
  app.get('/users/:id', async (req) => ({ id: req.params.id }));
  app.post('/users', async (req) => ({ created: req.body }));

  for (let i = 0; i < ROUTE_COUNT; i++) {
    const index = i;
    app.get(`/r${i}/:p`, async () => ({ i: index }));
  }

  const proxy = awsLambdaFastify(app);
  // Build the route tree before timing so the first measured call isn't paying init cost.
  await app.ready();

  return (event, context) => proxy(event, context);
}

module.exports = { name: 'fastify', version: pkg.version, build };
