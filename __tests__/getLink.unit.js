'use strict';

const delay = ms => new Promise(res => setTimeout(res, ms))

// Require Sinon.js library
const sinon = require('sinon')

const S3 = require('../lib/s3-service') // Init S3 Service

// Init API instance
const api = require('../index')({ version: 'v1.0' })


// NOTE: Set test to true
api._test = true;

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'Content-Type': 'application/json'
  }
}


/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/s3Link', async function(req,res) {
  stub.callsArgWith(2, null, 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ')
  let url = await res.getLink('s3://my-test-bucket/test/test.txt')
  res.send(url)
})

api.get('/s3LinkExpire', async function(req,res) {
  stub.callsArgWith(2, null, 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ')
  let url = await res.getLink('s3://my-test-bucket/test/test.txt',60)
  res.send(url)
})

api.get('/s3LinkInvalidExpire', async function(req,res) {
  stub.callsArgWith(2, null, 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ')
  let url = await res.getLink('s3://my-test-bucket/test/test.txt','test')
  res.send(url)
})


api.get('/s3LinkExpireFloat', async function(req,res) {
  stub.callsArgWith(2, null, 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ')
  let url = await res.getLink('s3://my-test-bucket/test/test.txt',3.145)
  res.send(url)
})

api.get('/s3LinkError', async function(req,res) {
  stub.callsArgWith(2, 'getSignedUrl error', null)
  let url = await res.getLink('s3://my-test-bucket/test/test.txt', async (e) => {
    return await delay(100).then(() => {})
  })
  res.send(url)
})

api.get('/s3LinkErrorCustom', async function(req,res) {
  stub.callsArgWith(2, 'getSignedUrl error', null)
  let url = await res.getLink('s3://my-test-bucket/test/test.txt', 60 ,async (e) => {
    return await delay(100).then(() => {
      res.error('Custom error')
    })
  })
  res.send(url)
})

api.get('/s3LinkErrorStandard', async function(req,res) {
  stub.callsArgWith(2, 'getSignedUrl error', null)
  let url = await res.getLink('s3://my-test-bucket/test/test.txt', 900)
  res.send(url)
})

api.get('/s3LinkInvalid', async function(req,res) {
  //stub.callsArgWith(2, 'getSignedUrl error', null)
  let url = await res.getLink('s3://my-test-bucket', 900)
  res.send(url)
})






/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

let stub

describe('getLink Tests:', function() {

  // this.slow(300)

  beforeEach(function() {
     // Stub getSignedUrl
    stub = sinon.stub(S3,'getSignedUrl')
  })

  it('Simple path', async function() {
    let _event = Object.assign({},event,{ path: '/s3Link' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ',
      isBase64Encoded: false
    })
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 900 })
  }) // end it

  it('Simple path (with custom expiration)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkExpire' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ',
      isBase64Encoded: false
    })
    // console.log(stub);
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 60 })
  }) // end it

  it('Simple path (with invalid expiration)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkInvalidExpire' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ',
      isBase64Encoded: false
    })
    // console.log(stub);
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 900 })
  }) // end it

  it('Simple path (with float expiration)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkExpireFloat' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ',
      isBase64Encoded: false
    })
    // console.log(stub);
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 3 })
  }) // end it

  it('Error (with delayed callback)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkError' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 500,
      body: '{"error":"getSignedUrl error"}',
      isBase64Encoded: false
    })
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 900 })
  }) // end it

  it('Custom Error (with delayed callback)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkErrorCustom' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 500,
      body: '{"error":"Custom error"}',
      isBase64Encoded: false
    })
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 60 })
  }) // end it

  it('Error (with default callback)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkErrorStandard' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 500,
      body: '{"error":"getSignedUrl error"}',
      isBase64Encoded: false
    })
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 900 })
  }) // end it

  it('Error (invalid S3 path)', async function() {
    let _event = Object.assign({},event,{ path: '/s3LinkInvalid' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 500,
      body: '{"error":"Invalid S3 path"}',
      isBase64Encoded: false
    })
  }) // end it

  afterEach(function() {
    stub.restore()
  })

}) // end getLink tests
