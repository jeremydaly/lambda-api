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
    'content-type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/cookie', function(req,res) {
  res.cookie('test','value').send({})
})

api.get('/cookieEncoded', function(req,res) {
  res.cookie('test','http:// [] foo;bar').send({})
})

api.get('/cookieObject', function(req,res) {
  res.cookie('test',{ foo: "bar" }).send({})
})

api.get('/cookieNonString', function(req,res) {
  res.cookie(123,'value').send({})
})

api.get('/cookieExpire', function(req,res) {
  res.cookie('test','value', { expires: new Date('January 1, 2019 00:00:00 GMT') }).send({})
})

api.get('/cookieMaxAge', function(req,res) {
  res.cookie('test','value', { maxAge: 60*60*1000 }).send({})
})

api.get('/cookieDomain', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieHttpOnly', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    httpOnly: true,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSecure', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    secure: true,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookiePath', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    secure: true,
    path: '/test',
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSameSiteTrue', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    sameSite: true,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSameSiteFalse', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    sameSite: false,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSameSiteString', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    sameSite: 'Test',
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieParse', function(req,res) {
  res.send({ cookies: req.cookies })
})

api.get('/cookieClear', function(req,res) {
  res.clearCookie('test').send({})
})

api.get('/cookieClearOptions', function(req,res) {
  res.clearCookie('test', { domain: 'test.com', httpOnly: true, secure: true }).send({})
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Cookie Tests:', function() {

  describe("Set", function() {
    it('Basic Session Cookie', function() {
      let _event = Object.assign({},event,{ path: '/cookie' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Basic Session Cookie (encoded value)', function() {
      let _event = Object.assign({},event,{ path: '/cookieEncoded' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=http%3A%2F%2F%20%5B%5D%20foo%3Bbar; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it


    it('Basic Session Cookie (object value)', function() {
      let _event = Object.assign({},event,{ path: '/cookieObject' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=%7B%22foo%22%3A%22bar%22%7D; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it


    it('Basic Session Cookie (non-string name)', function() {
      let _event = Object.assign({},event,{ path: '/cookieNonString' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': '123=value; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it


    it('Permanent Cookie (set expires)', function() {
      let _event = Object.assign({},event,{ path: '/cookieExpire' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set maxAge)', function() {
      let _event = Object.assign({},event,{ path: '/cookieMaxAge' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; MaxAge=3600; Expires='+ new Date(Date.now()+3600000).toUTCString() + '; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set domain)', function() {
      let _event = Object.assign({},event,{ path: '/cookieDomain' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set httpOnly)', function() {
      let _event = Object.assign({},event,{ path: '/cookieHttpOnly' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; HttpOnly; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set secure)', function() {
      let _event = Object.assign({},event,{ path: '/cookieSecure' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; Secure'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set path)', function() {
      let _event = Object.assign({},event,{ path: '/cookiePath' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/test; Secure'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set sameSite - true)', function() {
      let _event = Object.assign({},event,{ path: '/cookieSameSiteTrue' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; SameSite=Strict'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set sameSite - false)', function() {
      let _event = Object.assign({},event,{ path: '/cookieSameSiteFalse' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; SameSite=Lax'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Permanent Cookie (set sameSite - string)', function() {
      let _event = Object.assign({},event,{ path: '/cookieSameSiteString' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; SameSite=Test'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

  }) // end set tests


  describe("Parse", function() {

    it('Parse single cookie', function() {
      let _event = Object.assign({},event,{
        path: '/cookieParse',
        headers: {
          Cookie: "test=some%20value"
        }
      })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
          }, statusCode: 200, body: '{"cookies":{"test":"some value"}}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Parse & decode two cookies', function() {
      let _event = Object.assign({},event,{
        path: '/cookieParse',
        headers: {
          Cookie: "test=some%20value; test2=%7B%22foo%22%3A%22bar%22%7D"
        }
      })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
          }, statusCode: 200, body: '{\"cookies\":{\"test\":\"some value\",\"test2\":{\"foo\":\"bar\"}}}', isBase64Encoded: false
        })
      })
    }) // end it


    it('Parse & decode multiple cookies', function() {
      let _event = Object.assign({},event,{
        path: '/cookieParse',
        headers: {
          Cookie: "test=some%20value; test2=%7B%22foo%22%3A%22bar%22%7D; test3=domain"
        }
      })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
          }, statusCode: 200, body: '{\"cookies\":{\"test\":\"some value\",\"test2\":{\"foo\":\"bar\"},\"test3\":\"domain\"}}', isBase64Encoded: false
        })
      })
    }) // end it

  }) // end parse tests

  describe("Clear", function() {

    it('Clear cookie (no options)', function() {
      let _event = Object.assign({},event,{
        path: '/cookieClear'
      })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; MaxAge=-1; Path=/'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

    it('Clear cookie (w/ options)', function() {
      let _event = Object.assign({},event,{
        path: '/cookieClearOptions'
      })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'test=; Domain=test.com; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; MaxAge=-1; Path=/; Secure'
          }, statusCode: 200, body: '{}', isBase64Encoded: false
        })
      })
    }) // end it

  }) // end Clear tests

}) // end COOKIE tests
