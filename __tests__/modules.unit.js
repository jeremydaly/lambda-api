'use strict';

// Init API instance
const api = require('../index')({ version: 'v1.0' })

const appTest = require('./_testApp')

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'Content-Type': ['application/json']
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

  // this.slow(300);

  it('Standard module response', async function() {
    let _event = Object.assign({},event,{ path:'/testApp' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok","app":"app1"}', isBase64Encoded: false })
  }) // end it

  it('Module with promise', async function() {
    let _event = Object.assign({},event,{ path:'/testAppPromise' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok","app":"app2"}', isBase64Encoded: false })
  }) // end it

  it('Module with called error', async function() {
    let _event = Object.assign({},event,{ path:'/testAppError' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a called module error"}', isBase64Encoded: false })
  }) // end it

  it('Module with thrown error', async function() {
    let _event = Object.assign({},event,{ path:'/testAppThrownError' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a thrown module error"}', isBase64Encoded: false })
  }) // end it

}) // end MODULE tests
