'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })

const appTest = require('./_testApp')

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

api.get('/testApp', function(req,res) {
  appTest.app(req,res)
})

api.get('/testAppPromise', function(req,res) {
  appTest.promise(req,res)
})

api.get('/testAppError', function(req,res) {
  appTest.calledError(req,res)
})

api.get('/testAppThrownError', function(req,res) {
  appTest.thrownError(req,res)
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Module Tests:', function() {

  this.slow(300);

  it('Standard module response', function() {
    let _event = Object.assign({},event,{ path:'/testApp' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","app":"app1"}' })
    })
  }) // end it

  it('Module with promise', function() {
    let _event = Object.assign({},event,{ path:'/testAppPromise' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","app":"app2"}' })
    })
  }) // end it

  it('Module with called error', function() {
    let _event = Object.assign({},event,{ path:'/testAppError' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 500, body: '{"error":"This is a called module error"}' })
    })
  }) // end it

  it('Module with thrown error', function() {
    let _event = Object.assign({},event,{ path:'/testAppThrownError' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 500, body: '{"error":"This is a thrown module error"}' })
    })
  }) // end it

}) // end MODULE tests
