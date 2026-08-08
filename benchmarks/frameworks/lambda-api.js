'use strict';

/**
 * lambda-api adapter for the benchmark suite.
 *
 * Loaded directly from the repository working tree (../../), so `npm run bench` always
 * measures the local source — exactly what a maintainer iterating on performance wants.
 */

const createAPI = require('../../');
const pkg = require('../../package.json');
const { ROUTE_COUNT } = require('../lib/scenarios');

function build() {
  const api = createAPI();

  api.get('/', (req, res) => res.json({ hello: 'world' }));
  api.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
  api.post('/users', (req, res) => res.json({ created: req.body }));

  for (let i = 0; i < ROUTE_COUNT; i++) {
    const index = i;
    api.get(`/r${i}/:p`, (req, res) => res.json({ i: index }));
  }

  return (event, context) => api.run(event, context);
}

// package.json ships a 0.0.0-development placeholder (the real version is stamped at
// publish time), so prefer the release label the workflow passes in — same precedence
// as the run metadata in run.js.
const version = process.env.LAMBDA_API_VERSION || pkg.version;

module.exports = { name: 'lambda-api', version, build };
