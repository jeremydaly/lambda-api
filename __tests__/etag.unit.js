'use strict';

// Init API instance
const api = require('../index')({ version: 'v1.0' })

// NOTE: Set test to true
api._test = true;

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/testEtag', function(req,res) {
  res.etag(true).send({ test: true })
})

api.get('/testEtag2', function(req,res) {
  res.etag(true).send({ test: false })
})

api.get('/testEtagFalse', function(req,res) {
  res.etag(false).send({ noEtag: true })
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Etag Tests:', function() {

  it('Initial request', async function() {
    let _event = Object.assign({},event,{ path: '/testEtag'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: {
      'content-type': ['application/json'],
      'etag': ['"6fd977db9b2afe87a9ceee4843288129"']
    }, statusCode: 200, body: '{"test":true}', isBase64Encoded: false })
  }) // end it

  it('Initial request 2', async function() {
    let _event = Object.assign({},event,{ path: '/testEtag2'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: {
      'content-type': ['application/json'],
      'etag': ['"ad2ba8d138b3cda185243603ec9fcaa7"']
    }, statusCode: 200, body: '{"test":false}', isBase64Encoded: false })
  }) // end it

  it('Second request', async function() {
    let _event = Object.assign({},event,{ path: '/testEtag', multiValueHeaders: { 'If-None-Match': ['"6fd977db9b2afe87a9ceee4843288129"'] }})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: {
      'content-type': ['application/json'],
      'etag': ['"6fd977db9b2afe87a9ceee4843288129"']
    }, statusCode: 304, body: '', isBase64Encoded: false })
  }) // end it

  it('Second request 2', async function() {
    let _event = Object.assign({},event,{ path: '/testEtag2', multiValueHeaders: { 'If-None-Match': ['"ad2ba8d138b3cda185243603ec9fcaa7"'] }})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: {
      'content-type': ['application/json'],
      'etag': ['"ad2ba8d138b3cda185243603ec9fcaa7"']
    }, statusCode: 304, body: '', isBase64Encoded: false })
  }) // end it

  it('Non-matching Etags', async function() {
    let _event = Object.assign({},event,{ path: '/testEtag', multiValueHeaders: { 'If-None-Match': ['"ad2ba8d138b3cda185243603ec9fcaa7"'] }})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: {
      'content-type': ['application/json'],
      'etag': ['"6fd977db9b2afe87a9ceee4843288129"']
    }, statusCode: 200, body: '{"test":true}', isBase64Encoded: false })
  }) // end it

  it('Disable Etag', async function() {
    let _event = Object.assign({},event,{ path: '/testEtagFalse' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: {
      'content-type': ['application/json']
    }, statusCode: 200, body: '{"noEtag":true}', isBase64Encoded: false })
  }) // end it


}) // end ERROR HANDLING tests
