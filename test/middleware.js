'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })
const api2 = require('../index')({ version: 'v1.0' })
const api3 = require('../index')({ version: 'v1.0' })
const api4 = require('../index')({ version: 'v1.0' })
const api5 = require('../index')({ version: 'v1.0' })
const api6 = require('../index')({ version: 'v1.0' })
const api7 = require('../index')({ version: 'v1.0' })

// NOTE: Set test to true
api._test = true;
api2._test = true;
api3._test = true;
api4._test = true;
api5._test = true;
api6._test = true;
api7._test = true;

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  headers: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST MIDDLEWARE                                                ***/
/******************************************************************************/

api.use(function(req,res,next) {
  req.testMiddleware = '123'
  next()
});

// Middleware that accesses params, querystring, and body values
api.use(function(req,res,next) {
  req.testMiddleware2 = '456'
  req.testMiddleware3 = req.params.test
  req.testMiddleware4 = req.query.test ? req.query.test : null
  req.testMiddleware5 = req.body.test ? req.body.test : null
  next()
});

// Add middleware with promise/delay
api.use(function(req,res,next) {
  if (req.route === '/testPromise') {
    let start = Date.now()
    Promise.try(() => {
      for(let i = 0; i<100000000; i++) {}
      return true
    }).then((x) => {
      // console.log('Time:',Date.now()-start);
      req.testMiddlewarePromise = 'test'
      next()
    })
  } else {
    next()
  }
});


api2.use('/test',function(req,res,next) {
  req.testMiddleware = true
  next()
})

api2.use('/test/*',function(req,res,next) {
  req.testMiddlewareWildcard = true
  next()
})

api2.use('/test/:param1',function(req,res,next) {
  req.testMiddlewareParam = true
  next()
})

api2.use('/test/testing',function(req,res,next) {
  req.testMiddlewarePath = true
  next()
})


api3.use(['/test','/test/:param1','/test2/*'],function(req,res,next) {
  req.testMiddlewareAll = true
  next()
})

const middleware1 = (req,res,next) => {
  req.middleware1 = true
  next()
}

const middleware2 = (req,res,next) => {
  req.middleware2 = true
  next()
}

api4.use(middleware1,middleware2);
api5.use('/test/x',middleware1,middleware2);
api5.use('/test/y',middleware1);



api6.use((req,res,next) => {
  res.header('middleware1',true)
  return 'return from middleware'
})

// This shouldn't run
api6.use((req,res,next) => {
  res.header('middleware2',true)
  next()
})



api7.use((req,res,next) => {
  res.header('middleware1',true)
  res.send('return from middleware')
  next()
})

// This shouldn't run
api7.use((req,res,next) => {
  res.header('middleware2',true)
  next()
})

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/test', function(req,res) {
  res.status(200).json({ method: 'get', testMiddleware: req.testMiddleware, testMiddleware2: req.testMiddleware2 })
})

api.post('/test/:test', function(req,res) {
  res.status(200).json({ method: 'get', testMiddleware3: req.testMiddleware3, testMiddleware4: req.testMiddleware4, testMiddleware5: req.testMiddleware5 })
})

api.get('/testPromise', function(req,res) {
  res.status(200).json({ method: 'get', testMiddlewarePromise: req.testMiddlewarePromise })
})


api2.get('/test', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddleware ? true : false, middlewareWildcard: req.testMiddlewareWildcard ? true : false, middlewareParam: req.testMiddlewareParam ? true : false, middlewarePath: req.testMiddlewarePath ? true : false  })
})

api2.get('/test2/:test', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddleware ? true : false, middlewareWildcard: req.testMiddlewareWildcard ? true : false, middlewareParam: req.testMiddlewareParam ? true : false, middlewarePath: req.testMiddlewarePath ? true : false  })
})

api2.get('/test/xyz', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddleware ? true : false, middlewareWildcard: req.testMiddlewareWildcard ? true : false, middlewareParam: req.testMiddlewareParam ? true : false, middlewarePath: req.testMiddlewarePath ? true : false })
})

api2.get('/test/:param1', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddleware ? true : false, middlewareWildcard: req.testMiddlewareWildcard ? true : false, middlewareParam: req.testMiddlewareParam ? true : false, middlewarePath: req.testMiddlewarePath ? true : false })
})


api3.get('/test', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddlewareAll ? true : false })
})

api3.get('/test/:param1', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddlewareAll ? true : false })
})

api3.get('/test2/test', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddlewareAll ? true : false })
})

api3.get('/test3', function(req,res) {
  res.status(200).json({ method: 'get', middleware: req.testMiddlewareAll ? true : false })
})

api4.get('/test', (req,res) => {
  res.status(200).json({
    method: 'get',
    middleware1: req.middleware1 ? true : false,
    middleware2: req.middleware2 ? true : false
  })
})

api5.get('/test', (req,res) => {
  res.status(200).json({
    method: 'get',
    middleware1: req.middleware1 ? true : false,
    middleware2: req.middleware2 ? true : false
  })
})

api5.get('/test/x', (req,res) => {
  res.status(200).json({
    method: 'get',
    middleware1: req.middleware1 ? true : false,
    middleware2: req.middleware2 ? true : false
  })
})

api5.get('/test/y', (req,res) => {
  res.status(200).json({
    method: 'get',
    middleware1: req.middleware1 ? true : false,
    middleware2: req.middleware2 ? true : false
  })
})

api6.get('/test', (req,res) => {
  // This should not run because of the middleware return
  res.status(200).send('route response')
})

api7.get('/test', (req,res) => {
  // This should not run because of the middleware return
  res.status(200).send('route response')
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Middleware Tests:', function() {

  this.slow(300);

  it('Set Values in res object', async function() {
    let _event = Object.assign({},event,{})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","testMiddleware":"123","testMiddleware2":"456"}', isBase64Encoded: false })
  }) // end it

  it('Access params, querystring, and body values', async function() {
    let _event = Object.assign({},event,{ httpMethod: 'post', path: '/test/123', queryStringParameters: { test: "456" }, body: { test: "789" } })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","testMiddleware3":"123","testMiddleware4":"456","testMiddleware5":"789"}', isBase64Encoded: false })
  }) // end it


  it('Middleware with Promise/Delay', async function() {
    let _event = Object.assign({},event,{ path: '/testPromise'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","testMiddlewarePromise":"test"}', isBase64Encoded: false })
  }) // end it


  it('With matching string path', async function() {
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":true,"middlewareWildcard":false,"middlewareParam":false,"middlewarePath":false}', isBase64Encoded: false })
  }) // end it

  it('With non-matching string path', async function() {
    let _event = Object.assign({},event,{ path: '/test2/xyz' })
    let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":false,"middlewareWildcard":false,"middlewareParam":false,"middlewarePath":false}', isBase64Encoded: false })
  }) // end it

  it('Wildcard match', async function() {
    let _event = Object.assign({},event,{ path: '/test/xyz' })
    let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":false,"middlewareWildcard":true,"middlewareParam":false,"middlewarePath":false}', isBase64Encoded: false })
  }) // end it

  it('Parameter match', async function() {
    let _event = Object.assign({},event,{ path: '/test/testing' })
    let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":false,"middlewareWildcard":true,"middlewareParam":true,"middlewarePath":true}', isBase64Encoded: false })
  }) // end it



  it('Matching path (array)', async function() {
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":true}', isBase64Encoded: false })
  }) // end it

  it('Matching param (array)', async function() {
    let _event = Object.assign({},event,{ path: '/test/xyz' })
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":true}', isBase64Encoded: false })
  }) // end it

  it('Matching wildcard (array)', async function() {
    let _event = Object.assign({},event,{ path: '/test2/test' })
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":true}', isBase64Encoded: false })
  }) // end it

  it('Non-matching path (array)', async function() {
    let _event = Object.assign({},event,{ path: '/test3' })
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware":false}', isBase64Encoded: false })
  }) // end it


  it('Multiple middlewares (no path)', async function() {
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api4.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware1":true,"middleware2":true}', isBase64Encoded: false })
  }) // end it


  it('Multiple middlewares (w/o matching path)', async function() {
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware1":false,"middleware2":false}', isBase64Encoded: false })
  }) // end it


  it('Multiple middlewares (w/ matching path)', async function() {
    let _event = Object.assign({},event,{ path: '/test/x' })
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware1":true,"middleware2":true}', isBase64Encoded: false })
  }) // end it


  it('Single middleware (w/ matching path)', async function() {
    let _event = Object.assign({},event,{ path: '/test/y' })
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","middleware1":true,"middleware2":false}', isBase64Encoded: false })
  }) // end it


  it('Short-circuit route with middleware (async return)', async function() {
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api6.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: { 'content-type': 'application/json', middleware1: true },
      statusCode: 200, body: 'return from middleware', isBase64Encoded: false })
  }) // end it


  it('Short-circuit route with middleware (callback)', async function() {
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api7.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: { 'content-type': 'application/json', middleware1: true },
      statusCode: 200, body: 'return from middleware', isBase64Encoded: false })
  }) // end it


}) // end MIDDLEWARE tests
