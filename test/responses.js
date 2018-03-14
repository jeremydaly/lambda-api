'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library
const API = require('../index') // API library

// Init API instance
const api = new API({ version: 'v1.0', base: 'v1' });

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

}) // end ERROR HANDLING tests
