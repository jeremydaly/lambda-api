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
    getHeader: res.getHeader('testheader'),
    getHeaderCase: res.getHeader('coNtEnt-TyPe'),
    getHeaderMissing: res.getHeader('test') ? false : true,
    getHeaderEmpty: res.getHeader() ? false : true
  })
})

api.get('/hasHeader', function(req,res) {
  res.status(200).header('TestHeader','test')
  res.json({
    hasHeader: res.hasHeader('testheader'),
    hasHeaderCase: res.hasHeader('coNtEnt-TyPe'),
    hasHeaderMissing: res.hasHeader('test'),
    hasHeaderEmpty: res.hasHeader() ? false : true
  })
})

api.get('/removeHeader', function(req,res) {
  res.status(200).header('TestHeader','test').header('NewHeader','test').removeHeader('testHeader')
  res.json({
    removeHeader: res.hasHeader('testheader') ? false : true,
    hasHeader: res.hasHeader('NewHeader')
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

  describe('Standard Tests:', function() {
    it('New Header: /test -- test: testVal', function() {
      let _event = Object.assign({},event,{})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'test': 'testVal' }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
      })
    }) // end it

    it('Override Header: /testOveride -- Content-Type: text/html', function() {
      let _event = Object.assign({},event,{ path: '/testOverride'})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'content-type': 'text/html' }, statusCode: 200, body: '<div>testHTML</div>', isBase64Encoded: false })
      })
    }) // end it

    it('HTML Convenience Method: /testHTML', function() {
      let _event = Object.assign({},event,{ path: '/testHTML'})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'content-type': 'text/html' }, statusCode: 200, body: '<div>testHTML</div>', isBase64Encoded: false })
      })
    }) // end it


    it('Get Header', function() {
      let _event = Object.assign({},event,{ path: '/getHeader'})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'testheader': 'test'
          }, statusCode: 200,
          body: '{"headers":{"content-type":"application/json","testheader":"test"},"getHeader":"test","getHeaderCase":"application/json","getHeaderMissing":true,"getHeaderEmpty":false}',
          isBase64Encoded: false
        })
      })
    }) // end it

    it('Has Header', function() {
      let _event = Object.assign({},event,{ path: '/hasHeader'})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'testheader': 'test'
          }, statusCode: 200,
          body: '{"hasHeader":true,"hasHeaderCase":true,"hasHeaderMissing":false,"hasHeaderEmpty":false}',
          isBase64Encoded: false
        })
      })
    }) // end it

    it('Remove Header', function() {
      let _event = Object.assign({},event,{ path: '/removeHeader'})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'newheader': 'test'
          }, statusCode: 200,
          body: '{"removeHeader":true,"hasHeader":true}',
          isBase64Encoded: false
        })
      })
    }) // end it

  }) // end Standard tests

  describe('CORS Tests:', function() {

    it('Add Default CORS Headers', function() {
      let _event = Object.assign({},event,{ path: '/cors'})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'access-control-allow-headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
            'access-control-allow-methods': 'GET, PUT, POST, DELETE, OPTIONS',
            'access-control-allow-origin': '*'
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
            'content-type': 'application/json',
            'access-control-allow-headers': 'Content-Type, Authorization',
            'access-control-allow-methods': 'GET, OPTIONS',
            'access-control-allow-origin': 'example.com',
            'access-control-allow-credentials': 'true',
            'access-control-expose-headers': 'Content-Type',
            'access-control-max-age': '84000'
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
            'content-type': 'application/json',
            'access-control-allow-headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
            'access-control-allow-methods': 'GET, PUT, POST, DELETE, OPTIONS',
            'access-control-allow-origin': 'example.com',
            'access-control-allow-credentials': 'true'
          }, statusCode: 200,
          body: '{}',
          isBase64Encoded: false
        })
      })
    }) // end it

  }) // end CORS tests
}) // end HEADER tests
