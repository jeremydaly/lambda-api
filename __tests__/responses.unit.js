'use strict';

const sinon = require('sinon') // Require Sinon.js library
const S3 = require('../lib/s3-service') // Init S3 Service
const { gzipSync, brotliCompressSync, deflateSync } = require('zlib')

// Init API instance
const api = require('../index')({ version: 'v1.0' })
// Init secondary API for JSONP callback testing
const api2 = require('../index')({ version: 'v1.0', callback: 'cb' })
// Init API with custom serializer
const api3 = require('../index')({
  version: 'v1.0',
  serializer: body => JSON.stringify(Object.assign(body,{ _custom: true }))
})
// Init API with custom gzip serializer and base64
const api4 = require('../index')({
  version: 'v1.0',
  isBase64: true,
  headers: {
    'content-encoding': ['gzip']
  },
  serializer: body => {
    const json = JSON.stringify(Object.assign(body,{ _custom: true, _base64: true }))
    return gzipSync(json).toString('base64')
  }
})
// Init API with compression
const api5 = require('../index')({
  version: 'v1.0',
  compression: ['br', 'gzip', 'deflate']
})

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'Accept-Encoding': ['deflate, gzip'],
    'Content-Type': ['application/json']
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

api.get('/testSendStatus', function(req,res) {
  res.sendStatus(200)
})

api.get('/testSendStatus403', function(req,res) {
  res.sendStatus(403)
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

api.get('/redirect310', function(req,res) {
  res.redirect(310,'http://www.github.com')
})

api.get('/redirectHTML', function(req,res) {
  res.redirect('http://www.github.com?foo=bar&bat=baz<script>alert(\'not good\')</script>')
})

api.get('/s3Path', function(req,res) {
  stub.callsArgWithAsync(2, null, 'https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ')
  res.redirect('s3://my-test-bucket/test/test.txt')
})

api3.get('/test', function(req,res) {
  res.send({ object: true })
})

api3.get('/testJSON', function(req,res) {
  res.json({ object: true })
})

api3.get('/testJSONP', function(req,res) {
  res.jsonp({ object: true })
})

api4.get('/testGZIP', function(req,res) {
  res.json({ object: true })
})

api5.get('/testCompression', function(req,res) {
  res.json({ object: true })
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

let stub

describe('Response Tests:', function() {

  beforeEach(function() {
     // Stub getSignedUrl
    stub = sinon.stub(S3,'getSignedUrl')
  })

  it('Object response: convert to string', async function() {
    let _event = Object.assign({},event,{ path: '/testObjectResponse'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"object":true}', isBase64Encoded: false })
  }) // end it

  it('Numeric response: convert to string', async function() {
    let _event = Object.assign({},event,{ path: '/testNumberResponse'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '123', isBase64Encoded: false })
  }) // end it

  it('Array response: convert to string', async function() {
    let _event = Object.assign({},event,{ path: '/testArrayResponse'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '[1,2,3]', isBase64Encoded: false })
  }) // end it

  it('String response: no conversion', async function() {
    let _event = Object.assign({},event,{ path: '/testStringResponse'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'this is a string', isBase64Encoded: false })
  }) // end it

  it('Empty response', async function() {
    let _event = Object.assign({},event,{ path: '/testEmptyResponse'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '', isBase64Encoded: false })
  }) // end it

  it('sendStatus 200', async function() {
    let _event = Object.assign({},event,{ path: '/testSendStatus'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'OK', isBase64Encoded: false })
  }) // end it

  it('sendStatus 403', async function() {
    let _event = Object.assign({},event,{ path: '/testSendStatus403'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 403, body: 'Forbidden', isBase64Encoded: false })
  }) // end it

  it('JSONP response (default callback)', async function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'callback({"foo":"bar"})', isBase64Encoded: false })
  }) // end it

  it('JSONP response (using callback URL param)', async function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse', queryStringParameters: { callback: 'foo' }})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'foo({"foo":"bar"})', isBase64Encoded: false })
  }) // end it

  it('JSONP response (using cb URL param)', async function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse', queryStringParameters: { cb: 'bar' }})
    let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'bar({"foo":"bar"})', isBase64Encoded: false })
  }) // end it

  it('JSONP response (using URL param with spaces)', async function() {
    let _event = Object.assign({},event,{ path: '/testJSONPResponse', queryStringParameters: { callback: 'foo bar'}})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'foo_bar({"foo":"bar"})', isBase64Encoded: false })
  }) // end it

  it('Location method', async function() {
    let _event = Object.assign({},event,{ path: '/location'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'], 'location': ['http://www.github.com'] }, statusCode: 200, body: 'Location header set', isBase64Encoded: false })
  }) // end it

  it('Location method (encode URL)', async function() {
    let _event = Object.assign({},event,{ path: '/locationEncode'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'], 'location': ['http://www.github.com?foo=bar%20with%20space'] }, statusCode: 200, body: 'Location header set', isBase64Encoded: false })
  }) // end it

  it('Redirect (default 302)', async function() {
    let _event = Object.assign({},event,{ path: '/redirect'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'], 'location': ['http://www.github.com'] }, statusCode: 302, body: '<p>302 Redirecting to <a href="http://www.github.com">http://www.github.com</a></p>', isBase64Encoded: false })
  }) // end it

  it('Redirect (301)', async function() {
    let _event = Object.assign({},event,{ path: '/redirect301'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'], 'location': ['http://www.github.com'] }, statusCode: 301, body: '<p>301 Redirecting to <a href="http://www.github.com">http://www.github.com</a></p>', isBase64Encoded: false })
  }) // end it

  it('Redirect (310 - Invalid Code)', async function() {
    let _event = Object.assign({},event,{ path: '/redirect310'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"310 is an invalid redirect status code"}', isBase64Encoded: false })
  }) // end it

  it('Redirect (escape html)', async function() {
    let _event = Object.assign({},event,{ path: '/redirectHTML'})
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'], 'location': ['http://www.github.com?foo=bar&bat=baz%3Cscript%3Ealert(\'not%20good\')%3C/script%3E'] }, statusCode: 302, body: '<p>302 Redirecting to <a href=\"http://www.github.com?foo=bar&amp;bat=baz&lt;script&gt;alert(&#39;not good&#39;)&lt;/script&gt;\">http://www.github.com?foo=bar&amp;bat=baz&lt;script&gt;alert(&#39;not good&#39;)&lt;/script&gt;</a></p>', isBase64Encoded: false })
  }) // end it

  it('S3 Path', async function() {
    let _event = Object.assign({},event,{ path: '/s3Path' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/html'],
        'location': ['https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&Expires=1534290845&Signature=XYZ']
      },
      statusCode: 302,
      body: '<p>302 Redirecting to <a href="https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&amp;Expires=1534290845&amp;Signature=XYZ">https://s3.amazonaws.com/my-test-bucket/test/test.txt?AWSAccessKeyId=AKXYZ&amp;Expires=1534290845&amp;Signature=XYZ</a></p>',
      isBase64Encoded: false
    })
    expect(stub.lastCall.args[1]).toEqual({ Bucket: 'my-test-bucket', Key: 'test/test.txt', Expires: 900 })
  }) // end it


  it('Custom serializer', async function() {
    let _event = Object.assign({},event,{ path: '/test'})
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"object":true,"_custom":true}', isBase64Encoded: false })
  }) // end it

  it('Custom serializer (JSON)', async function() {
    let _event = Object.assign({},event,{ path: '/testJSON'})
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"object":true,"_custom":true}', isBase64Encoded: false })
  }) // end it

  it('Custom serializer (JSONP)', async function() {
    let _event = Object.assign({},event,{ path: '/testJSONP'})
    let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'callback({"object":true,"_custom":true})', isBase64Encoded: false })
  }) // end it

  it('Custom serializer (GZIP)', async function() {
    let _event = Object.assign({},event,{ path: '/testGZIP'})
    let result = await new Promise(r => api4.run(_event,{},(e,res) => { r(res) }))

    let body = gzipSync(`{"object":true,"_custom":true,"_base64":true}`).toString('base64')
    expect(result).toEqual({ multiValueHeaders: { 'content-encoding': ['gzip'], 'content-type': ['application/json'] }, statusCode: 200, body, isBase64Encoded: true })
  }) // end it

  it('Compression (GZIP)', async function() {
    let _event = Object.assign({},event,{ path: '/testCompression'})
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    let body = gzipSync(`{"object":true}`).toString('base64')
    expect(result).toEqual({ multiValueHeaders: { 'content-encoding': ['gzip'], 'content-type': ['application/json'] }, statusCode: 200, body, isBase64Encoded: true })
  }) // end it

  it('Compression (Brotli)', async function() {
    let _event = Object.assign({},event,{ path: '/testCompression'})
    _event.multiValueHeaders['Accept-Encoding'] = ['br','deflate','gzip']
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    let body = brotliCompressSync(`{"object":true}`).toString('base64')
    expect(result).toEqual({ multiValueHeaders: { 'content-encoding': ['br'], 'content-type': ['application/json'] }, statusCode: 200, body, isBase64Encoded: true })
  }) // end it

  it('Compression (Deflate)', async function() {
    let _event = Object.assign({},event,{ path: '/testCompression'})
    _event.multiValueHeaders['Accept-Encoding'] = ['deflate']
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    let body = deflateSync(`{"object":true}`).toString('base64')
    expect(result).toEqual({ multiValueHeaders: { 'content-encoding': ['deflate'], 'content-type': ['application/json'] }, statusCode: 200, body, isBase64Encoded: true })
  }) // end it

  it('Compression (Unknown)', async function() {
    let _event = Object.assign({},event,{ path: '/testCompression'})
    _event.multiValueHeaders['Accept-Encoding'] = ['xxx']
    let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
    let body = `{"object":true}`
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body, isBase64Encoded: false })
  }) // end it

  afterEach(function() {
    stub.restore()
  })

}) // end ERROR HANDLING tests
