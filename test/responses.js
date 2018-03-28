'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })
// Init secondary API for JSONP callback testing
const api2 = require('../index')({ version: 'v1.0', callback: 'cb' })

// NOTE: Set test to true
api._test = true;
api2._test = true;

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

api.get('/testObjectResponse', function(req,res) {
  res.send({ object: true })
})

api.get('/testNumberResponse', function(req,res) {
  res.send(123)
})

api.get('/testArrayResponse', function(req,res) {
  res.send([1,2,3])
})

api.get('/testStringResponse', function(req,res) {
  res.send('this is a string')
})

api.get('/testEmptyResponse', function(req,res) {
  res.send()
})

api.get('/testJSONPResponse', function(req,res) {
  res.jsonp({ foo: 'bar' })
})

// Secondary route
api2.get('/testJSONPResponse', function(req,res) {
  res.jsonp({ foo: 'bar' })
})

api.get('/location', function(req,res) {
  res.location('http://www.github.com').html('Location header set')
})

api.get('/locationEncode', function(req,res) {
  res.location('http://www.github.com?foo=bar with space').html('Location header set')
})

api.get('/redirect', function(req,res) {
  res.redirect('http://www.github.com')
})

api.get('/redirect301', function(req,res) {
  res.redirect(301,'http://www.github.com')
})

api.get('/redirectHTML', function(req,res) {
  res.redirect('http://www.github.com?foo=bar&bat=baz<script>alert(\'not good\')</script>')
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Response Tests:', function() {

  it('Object response: convert to string', function() {
    let _event = Object.assign({},event,{ path: '/testObjectResponse'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"object":true}' })
    })
  }) // end it

  it('Numeric response: convert to string', function() {
    let _event = Object.assign({},event,{ path: '/testNumberResponse'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '123' })
    })
  }) // end it

  it('Array response: convert to string', function() {
    let _event = Object.assign({},event,{ path: '/testArrayResponse'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '[1,2,3]' })
    })
  }) // end it

  it('String response: no conversion', function() {
    let _event = Object.assign({},event,{ path: '/testStringResponse'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: 'this is a string' })
    })
  }) // end it

  it('Empty response', function() {
    let _event = Object.assign({},event,{ path: '/testEmptyResponse'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '' })
    })
  }) // end it

  it('JSONP response (default callback)', function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: 'callback({"foo":"bar"})' })
    })
  }) // end it

  it('JSONP response (using callback URL param)', function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse', queryStringParameters: { callback: 'foo' }})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: 'foo({"foo":"bar"})' })
    })
  }) // end it


  it('JSONP response (using cb URL param)', function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse', queryStringParameters: { cb: 'bar' }})

    return new Promise((resolve,reject) => {
      api2.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: 'bar({"foo":"bar"})' })
    })
  }) // end it

  it('JSONP response (using URL param with spaces)', function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse', queryStringParameters: { callback: 'foo bar'}})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: 'foo_bar({"foo":"bar"})' })
    })
  }) // end it

  it('Location method', function() {
    let _event = Object.assign({},event,{ path: '/location'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html', 'Location': 'http://www.github.com' }, statusCode: 200, body: 'Location header set' })
    })
  }) // end it

  it('Location method (encode URL)', function() {
    let _event = Object.assign({},event,{ path: '/locationEncode'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html', 'Location': 'http://www.github.com?foo=bar%20with%20space' }, statusCode: 200, body: 'Location header set' })
    })
  }) // end it

  it('Redirect (default 302)', function() {
    let _event = Object.assign({},event,{ path: '/redirect'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html', 'Location': 'http://www.github.com' }, statusCode: 302, body: '<p>302 Redirecting to <a href="http://www.github.com">http://www.github.com</a></p>' })
    })
  }) // end it

  it('Redirect (301)', function() {
    let _event = Object.assign({},event,{ path: '/redirect301'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html', 'Location': 'http://www.github.com' }, statusCode: 301, body: '<p>301 Redirecting to <a href="http://www.github.com">http://www.github.com</a></p>' })
    })
  }) // end it

  it('Redirect (escape html)', function() {
    let _event = Object.assign({},event,{ path: '/redirectHTML'})

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'text/html', 'Location': 'http://www.github.com?foo=bar&bat=baz%3Cscript%3Ealert(\'not%20good\')%3C/script%3E' }, statusCode: 302, body: '<p>302 Redirecting to <a href=\"http://www.github.com?foo=bar&amp;bat=baz&lt;script&gt;alert(&#39;not good&#39;)&lt;/script&gt;\">http://www.github.com?foo=bar&amp;bat=baz&lt;script&gt;alert(&#39;not good&#39;)&lt;/script&gt;</a></p>' })
    })
  }) // end it

}) // end ERROR HANDLING tests
