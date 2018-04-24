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
/***  REGISTER ROUTES                                                       ***/
/******************************************************************************/

api.register(require('./_testRoutes-v1'), { prefix: '/v1' })
api.register(require('./_testRoutes-v1'), { prefix: '/vX/vY' })
api.register(require('./_testRoutes-v1'), { prefix: '' })
api.register(require('./_testRoutes-v2'), { prefix: '/v2' })

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Register Tests:', function() {

  it('No prefix', function() {
    let _event = Object.assign({},event,{ path: '/test-register' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/test-register","route":"/test-register","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('No prefix (nested)', function() {
    let _event = Object.assign({},event,{ path: '/test-register/sub1' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/test-register/sub1","route":"/test-register/sub1","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('No prefix (nested w/ param)', function() {
    let _event = Object.assign({},event,{ path: '/test-register/TEST/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}', isBase64Encoded: false })
    })
  }) // end it


  it('With prefix', function() {
    let _event = Object.assign({},event,{ path: '/v1/test-register' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/v1/test-register","route":"/test-register","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('With prefix (nested)', function() {
    let _event = Object.assign({},event,{ path: '/v1/test-register/sub1' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/v1/test-register/sub1","route":"/test-register/sub1","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('With prefix (nested w/ param)', function() {
    let _event = Object.assign({},event,{ path: '/v1/test-register/TEST/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/v1/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}', isBase64Encoded: false })
    })
  }) // end it


  it('With double prefix', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/test-register' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/test-register","route":"/test-register","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('With double prefix (nested)', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/test-register/sub1' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/test-register/sub1","route":"/test-register/sub1","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('With double prefix (nested w/ param)', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/test-register/TEST/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}', isBase64Encoded: false })
    })
  }) // end it


  it('With recursive prefix', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/vZ/test-register' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/vZ/test-register","route":"/test-register","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('With recursive prefix (nested)', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/vZ/test-register/sub1' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/vZ/test-register/sub1","route":"/test-register/sub1","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('With recursive prefix (nested w/ param)', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/vZ/test-register/TEST/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/vZ/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}', isBase64Encoded: false })
    })
  }) // end it

  it('After recursive interation', function() {
    let _event = Object.assign({},event,{ path: '/vX/vY/test-register/sub2' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/vX/vY/test-register/sub2","route":"/test-register/sub2","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('New prefix', function() {
    let _event = Object.assign({},event,{ path: '/v2/test-register' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/v2/test-register","route":"/test-register","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('New prefix (nested)', function() {
    let _event = Object.assign({},event,{ path: '/v2/test-register/sub1' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/v2/test-register/sub1","route":"/test-register/sub1","method":"GET"}', isBase64Encoded: false })
    })
  }) // end it

  it('New prefix (nested w/ param)', function() {
    let _event = Object.assign({},event,{ path: '/v2/test-register/TEST/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"path":"/v2/test-register/TEST/test","route":"/test-register/:param1/test","method":"GET","params":{"param1":"TEST"}}', isBase64Encoded: false })
    })
  }) // end it

}) // end ROUTE tests
