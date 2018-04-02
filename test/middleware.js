'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })

// NOTE: Set test to true
api._test = true;

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
      for(let i = 0; i<40000000; i++) {}
      return true
    }).then((x) => {
      //console.log('Time:',Date.now()-start);
      req.testMiddlewarePromise = 'test'
      next()
    })
  } else {
    next()
  }
});

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


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Middleware Tests:', function() {

  this.slow(300);

  it('Set Values in res object', function() {
    let _event = Object.assign({},event,{})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","testMiddleware":"123","testMiddleware2":"456"}', isBase64Encoded: false })
    })
  }) // end it

  it('Access params, querystring, and body values', function() {
    let _event = Object.assign({},event,{ httpMethod: 'post', path: '/test/123', queryStringParameters: { test: "456" }, body: { test: "789" } })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","testMiddleware3":"123","testMiddleware4":"456","testMiddleware5":"789"}', isBase64Encoded: false })
    })
  }) // end it


  it('Middleware with Promise/Delay', function() {
    let _event = Object.assign({},event,{ path: '/testPromise'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","testMiddlewarePromise":"test"}', isBase64Encoded: false })
    })
  }) // end it

}) // end MIDDLEWARE tests
