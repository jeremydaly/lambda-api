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
    'Content-Type': ['application/json']
  }
}


/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/cache', function(req,res) {
  res.cache().send('cache')
})

api.get('/cacheTrue', function(req,res) {
  res.cache(true).send('cache')
})

api.get('/cacheFalse', function(req,res) {
  res.cache(false).send('cache')
})

api.get('/cacheMaxAge', function(req,res) {
  res.cache(1000).send('cache')
})

api.get('/cachePrivate', function(req,res) {
  res.cache(1000,true).send('cache')
})

api.get('/cachePrivateFalse', function(req,res) {
  res.cache(1000,false).send('cache')
})

api.get('/cachePrivateInvalid', function(req,res) {
  res.cache(1000,'test').send('cache')
})

api.get('/cacheCustom', function(req,res) {
  res.cache('custom value').send('cache')
})

api.get('/cacheCustomUndefined', function(req,res) {
  res.cache(undefined).send('cache')
})

api.get('/cacheCustomNull', function(req,res) {
  res.cache(null).send('cache')
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('cacheControl Tests:', function() {

  it('Basic cacheControl (no options)', async function() {
    let _event = Object.assign({},event,{ path: '/cache' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (true)', async function() {
    let _event = Object.assign({},event,{ path: '/cacheTrue' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (false)', async function() {
    let _event = Object.assign({},event,{ path: '/cacheFalse' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['no-cache, no-store, must-revalidate']
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (maxAge)', async function() {
    let _event = Object.assign({},event,{ path: '/cacheMaxAge' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=1'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (private)', async function() {
    let _event = Object.assign({},event,{ path: '/cachePrivate' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['private, max-age=1'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (disable private)', async function() {
    let _event = Object.assign({},event,{ path: '/cachePrivateFalse' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=1'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (invalid private value)', async function() {
    let _event = Object.assign({},event,{ path: '/cachePrivateInvalid' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=1'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (undefined)', async function() {
    let _event = Object.assign({},event,{ path: '/cacheCustomUndefined' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Basic cacheControl (null)', async function() {
    let _event = Object.assign({},event,{ path: '/cacheCustomNull' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

  it('Custom cacheControl (string)', async function() {
    let _event = Object.assign({},event,{ path: '/cacheCustom' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['custom value']
      },
      statusCode: 200,
      body: 'cache',
      isBase64Encoded: false
    })
  }) // end it

}) // end UNIT tests
