'use strict';

/**
 * Shared benchmark scenarios. Every framework registers the same canonical routes
 * (see frameworks/*.js) and is exercised with the same set of requests, against both
 * API Gateway v1 and v2 events.
 *
 * `expect` is the correctness gate (lib/validate.js): a handler must produce this exact
 * status (and matching body fields, when given) before it is timed — so we never publish
 * numbers for a framework that is silently 404-ing, throwing, or returning the wrong shape.
 *
 * The 50 `r{i}/:p` routes (registered by each framework) make `routing-50` a meaningful
 * test of routing cost as the route table grows.
 */

const ROUTE_COUNT = 50;

const scenarios = [
  {
    id: 'get-json',
    description: 'simplest GET returning a small JSON object',
    method: 'GET',
    path: '/',
    expect: { status: 200, body: { hello: 'world' } }
  },
  {
    id: 'path-param',
    description: 'GET with a single path parameter',
    method: 'GET',
    path: '/users/42',
    expect: { status: 200, body: { id: '42' } }
  },
  {
    id: 'post-json',
    description: 'POST that parses a JSON body and echoes it',
    method: 'POST',
    path: '/users',
    body: { name: 'ada' },
    expect: { status: 200, body: { created: { name: 'ada' } } }
  },
  {
    id: 'routing-50',
    description: 'routing cost with 50 registered routes (hits the last one)',
    method: 'GET',
    path: '/r' + (ROUTE_COUNT - 1) + '/x',
    expect: { status: 200, body: { i: ROUTE_COUNT - 1 } }
  },
  {
    id: 'not-found',
    description: 'unmatched route returns 404',
    method: 'GET',
    path: '/does-not-exist',
    expect: { status: 404 }
  }
];

module.exports = { scenarios, ROUTE_COUNT };
