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

}) // end HEADER tests
