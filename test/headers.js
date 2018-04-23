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
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/
api.get('/test', function(req,res) {
  res.header('test','testVal')
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/testOverride', function(req,res) {
  res.header('Content-Type','text/html')
  res.status(200).send('<div>testHTML</div>')
})

api.get('/testHTML', function(req,res) {
  res.status(200).html('<div>testHTML</div>')
})

api.get('/testJSONP', function(req,res) {
  res.status(200).html({ method: 'get', status: 'ok' })
})

api.get('/getHeader', function(req,res) {
  res.status(200).header('TestHeader','test')
  res.json({
    headers: res.getHeader(),
    typeHeader: res.getHeader('TestHeader'),
    typeHeaderCase: res.getHeader('coNtEnt-TyPe'),
    typeHeaderMissing: res.getHeader('test')
  })
})

api.get('/cors', function(req,res) {
  res.cors().json({})
})

api.get('/corsCustom', function(req,res) {
  res.cors({
    origin: 'example.com',
    methods: 'GET, OPTIONS',
    headers: 'Content-Type, Authorization',
    maxAge: 84000000,
    credentials: true,
    exposeHeaders: 'Content-Type'
  }).json({})
})

api.get('/corsOverride', function(req,res) {
  res.cors().cors({
    origin: 'example.com',
    credentials: true
  }).json({})
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Header Tests:', function() {

  it('New Header: /test -- test: testVal', function() {
    let _event = Object.assign({},event,{})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json', 'test': 'testVal' }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    })
  }) // end it

  it('Override Header: /testOveride -- Content-Type: text/html', function() {
    let _event = Object.assign({},event,{ path: '/testOverride'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html' }, statusCode: 200, body: '<div>testHTML</div>', isBase64Encoded: false })
    })
  }) // end it

  it('HTML Convenience Method: /testHTML', function() {
    let _event = Object.assign({},event,{ path: '/testHTML'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html' }, statusCode: 200, body: '<div>testHTML</div>', isBase64Encoded: false })
    })
  }) // end it


  it('Get Header', function() {
    let _event = Object.assign({},event,{ path: '/getHeader'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'application/json',
          'TestHeader': 'test'
        }, statusCode: 200,
        body: '{"headers":{"Content-Type":"application/json","TestHeader":"test"},"typeHeader":"test","typeHeaderCase":"application/json","typeHeaderMissing":null}',
        isBase64Encoded: false
      })
    })
  }) // end it


  it('Add Default CORS Headers', function() {
    let _event = Object.assign({},event,{ path: '/cors'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Origin': '*'
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    })
  }) // end it

  it('Add Custom CORS Headers', function() {
    let _event = Object.assign({},event,{ path: '/corsCustom'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Origin': 'example.com',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Expose-Headers': 'Content-Type',
          'Access-Control-Max-Age': '84000'
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    })
  }) // end it

  it('Override CORS Headers', function() {
    let _event = Object.assign({},event,{ path: '/corsOverride'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Origin': 'example.com',
          'Access-Control-Allow-Credentials': 'true'
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    })
  }) // end it

}) // end HEADER tests
