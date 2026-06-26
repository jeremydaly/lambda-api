'use strict';

/**
 * Baseline: a hand-written Lambda handler with zero framework abstraction.
 *
 * Establishes the theoretical lower bound for request handling — event parse, a manual
 * route match, JSON serialize. Every framework's overhead is meaningfully read as the gap
 * above this floor.
 *
 * @author Benchmark suite for lambda-api (issue #34)
 * @license MIT
 */

const { ROUTE_COUNT } = require('../lib/scenarios');

function pathOf(event) {
  return event.rawPath || event.path;
}

function methodOf(event) {
  return event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method);
}

// Emit the response shape lambda-api / the adapters produce for each event format.
function reply(event, statusCode, payload) {
  const body = JSON.stringify(payload);
  if (event.version === '2.0') {
    return { statusCode, headers: { 'content-type': 'application/json' }, body, isBase64Encoded: false };
  }
  return {
    statusCode,
    multiValueHeaders: { 'content-type': ['application/json'] },
    body,
    isBase64Encoded: false
  };
}

const USER_RE = /^\/users\/([^/]+)$/;
const ROUTE_RE = /^\/r(\d+)\/([^/]+)$/;

function build() {
  return async (event) => {
    const path = pathOf(event);
    const method = methodOf(event);

    if (method === 'GET' && path === '/') return reply(event, 200, { hello: 'world' });

    if (method === 'POST' && path === '/users') {
      const parsed = event.body ? JSON.parse(event.body) : {};
      return reply(event, 200, { created: parsed });
    }

    let match;
    if (method === 'GET' && (match = USER_RE.exec(path))) {
      return reply(event, 200, { id: match[1] });
    }

    if (method === 'GET' && (match = ROUTE_RE.exec(path))) {
      const i = Number(match[1]);
      if (i >= 0 && i < ROUTE_COUNT) return reply(event, 200, { i });
    }

    return reply(event, 404, { error: 'Not Found' });
  };
}

module.exports = { name: 'baseline', version: '-', build };
