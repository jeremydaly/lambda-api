'use strict';

// Regression coverage for GitHub issue #257 ("Is it possible to disable versioning?").
//
// lambda-api does NOT perform any automatic version detection or stripping. A
// version-like path segment (e.g. `v1`) is matched literally and exposed on
// `req.params` just like any other parameter value. These tests lock that in so
// the behavior can never silently regress.

// Init API instance (no base -- matching the reporter's setup)
const api = require('../index')();

// NOTE: Set test to true
api._test = true;

let event = {
  httpMethod: 'get',
  path: '/',
  body: {},
  multiValueHeaders: {
    'Content-Type': ['application/json']
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/
api.get('/:v/schema.json', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok', v: req.params.v })
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Versioning (issue #257) Tests:', function() {

  it('Version-like segment is matched literally: /v1/schema.json', async function() {
    let _event = Object.assign({},event,{ path: '/v1/schema.json' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok","v":"v1"}', isBase64Encoded: false })
  }) // end it

  it('Non-version first segment is matched the same way: /abc/schema.json', async function() {
    let _event = Object.assign({},event,{ path: '/abc/schema.json' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok","v":"abc"}', isBase64Encoded: false })
  }) // end it

  it('No version segment is consumed -- extra segment still 404s: /v1/x/schema.json', async function() {
    let _event = Object.assign({},event,{ path: '/v1/x/schema.json' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
  }) // end it

  it("Setting base to a version collides with a leading :param (documented caveat)", async function() {
    // With `base: 'v1'`, the literal `v1` base segment consumes the first path
    // segment, so `/v1/schema.json` matches `v1` + `:v` (schema.json) and never
    // reaches the handler -- yielding a 405. Prefer a base like `/api` over a
    // version, or use `register({ prefix })` for versioned route groups.
    const basedApi = require('../index')({ base: 'v1' })
    basedApi._test = true;
    basedApi.get('/:v/schema.json', function(req,res) {
      res.status(200).json({ v: req.params.v })
    })

    let _event = Object.assign({},event,{ path: '/v1/schema.json' })
    let result = await new Promise(r => basedApi.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 405, body: '{"error":"Method not allowed"}', isBase64Encoded: false })
  }) // end it

}) // end VERSIONING tests
