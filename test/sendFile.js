'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

const fs = require('fs') // Require Node.js file system

// Require Sinon.js library
const sinon = require('sinon')

const AWS = require('aws-sdk') // AWS SDK (automatically available in Lambda)

// AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'madlucas'})

const S3 = require('../lib/s3-service') // Init S3 Service

// Init API instance
const api = require('../index')({ version: 'v1.0', mimeTypes: { test: 'text/test' } })

// NOTE: Set test to true
api._test = true;

let event = {
  httpMethod: 'get',
  path: '/',
  body: {},
  headers: {
    'content-type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/sendfile/badpath', function(req,res) {
  res.sendFile()
})

api.get('/sendfile', function(req,res) {
  res.sendFile('./test-missing.txt')
})

api.get('/sendfile/root', function(req,res) {
  res.sendFile('test.txt', { root: './test/' })
})

api.get('/sendfile/err', function(req,res) {
  res.sendFile('./test-missing.txt', err => {
    if (err) {
      res.status(404).error('There was an error accessing the requested file')
    }
  })
})

api.get('/sendfile/test', function(req,res) {
  res.sendFile('test/test.txt' + (req.query.test ? req.query.test : ''), err => {
    // Return a promise
    return Promise.try(() => {
      for(let i = 0; i<40000000; i++) {}
      return true
    }).then((x) => {
      if (err) {
        // set custom error code and message on error
        res.status(501).error('Custom File Error')
      } else {
        // else set custom response code
        res.status(201)
      }
    })

  })
})

api.get('/sendfile/error', function(req,res) {
  res.sendFile('test/test.txtx', err => {

    // Return a promise
    return Promise.try(() => {
      for(let i = 0; i<40000000; i++) {}
      return true
    }).then((x) => {
      if (err) {
        // log error
        return true
      }
    })

  })
})

api.get('/sendfile/buffer', function(req,res) {
  res.sendFile(fs.readFileSync('test/test.txt'))
})

api.get('/sendfile/headers', function(req,res) {
  res.sendFile('test/test.txt', {
    headers: { 'x-test': 'test', 'x-timestamp': 1 }
  })
})

api.get('/sendfile/headers-private', function(req,res) {
  res.sendFile('test/test.txt', {
    headers: { 'x-test': 'test', 'x-timestamp': 1 },
    private: true
  })
})

api.get('/sendfile/last-modified', function(req,res) {
  res.sendFile('test/test.txt', {
    lastModified: new Date('Fri, 1 Jan 2018 00:00:00 GMT')
  })
})

api.get('/sendfile/no-last-modified', function(req,res) {
  res.sendFile('test/test.txt', {
    lastModified: false
  })
})

api.get('/sendfile/no-cache-control', function(req,res) {
  res.sendFile('test/test.txt', {
    cacheControl: false
  })
})

api.get('/sendfile/custom-cache-control', function(req,res) {
  res.sendFile('test/test.txt', {
    cacheControl: 'no-cache, no-store'
  })
})

// S3 file
api.get('/sendfile/s3', function(req,res) {

  stub.withArgs({Bucket: 'my-test-bucket', Key: 'test.txt'}).returns({
    promise: () => { return {
      AcceptRanges: 'bytes',
      LastModified: new Date('2018-04-01T13:32:58.000Z'),
      ContentLength: 23,
      ETag: '"ae771fbbba6a74eeeb77754355831713"',
      ContentType: 'text/plain',
      Metadata: {},
      Body: Buffer.from('Test file for sendFile\n')
    }}
  })

  res.sendFile('s3://my-test-bucket/test.txt')
})

api.get('/sendfile/s3path', function(req,res) {

  stub.withArgs({Bucket: 'my-test-bucket', Key: 'test/test.txt'}).returns({
    promise: () => { return {
      AcceptRanges: 'bytes',
      LastModified: new Date('2018-04-01T13:32:58.000Z'),
      ContentLength: 23,
      ETag: '"ae771fbbba6a74eeeb77754355831713"',
      ContentType: 'text/plain',
      Metadata: {},
      Body: Buffer.from('Test file for sendFile\n')
    }}
  })

  res.sendFile('s3://my-test-bucket/test/test.txt')
})

api.get('/sendfile/s3missing', function(req,res) {

  stub.withArgs({Bucket: 'my-test-bucket', Key: 'file-does-not-exist.txt'})
    .throws(new Error("NoSuchKey: The specified key does not exist."))

  res.sendFile('s3://my-test-bucket/file-does-not-exist.txt')
})

api.get('/sendfile/s3-bad-path', function(req,res) {
  res.sendFile('s3://my-test-bucket')
})

// Error Middleware
api.use(function(err,req,res,next) {
  // Set x-error header to test middleware execution
  res.header('x-error','true')
  next()
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

let stub

describe('SendFile Tests:', function() {

  before(function() {
     // Stub getObjectAsync
    stub = sinon.stub(S3,'getObject')
  })

  it('Bad path', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/badpath' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json','x-error': 'true' }, statusCode: 500, body: '{"error":"Invalid file"}', isBase64Encoded: false })
  }) // end it

  it('Missing file', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json','x-error': 'true' }, statusCode: 500, body: '{"error":"ENOENT: no such file or directory, open \'./test-missing.txt\'"}', isBase64Encoded: false })
  }) // end it

  it('Missing file with custom catch', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/err' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json','x-error': 'true' }, statusCode: 404, body: '{"error":"There was an error accessing the requested file"}', isBase64Encoded: false })
  }) // end it

  it('Text file w/ callback override (promise)', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/test' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'max-age=0',
        'expires': result.headers.expires,
        'last-modified': result.headers['last-modified']
      },
      statusCode: 201, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Text file error w/ callback override (promise)', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/test', queryStringParameters: { test: 'x' } })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json','x-error': 'true' }, statusCode: 501, body: '{"error":"Custom File Error"}', isBase64Encoded: false })
  }) // end it

  it('Text file error w/ callback override (promise - no end)', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/error', queryStringParameters: { test: 'x' } })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json','x-error': 'true' }, statusCode: 500, body: result.body, isBase64Encoded: false })
  }) // end it

  it('Buffer Input', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/buffer' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'application/json',
        'cache-control': 'max-age=0',
        'expires': result.headers.expires,
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Text file w/ headers', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/headers' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'x-test': 'test',
        'x-timestamp': 1,
        'cache-control': 'max-age=0',
        'expires': result.headers.expires,
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Text file w/ root path', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/root' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'max-age=0',
        'expires': result.headers.expires,
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Text file w/ headers (private cache)', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/headers-private' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'x-test': 'test',
        'x-timestamp': 1,
        'cache-control': 'private, max-age=0',
        'expires': result.headers.expires,
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Text file custom Last-Modified', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/last-modified' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'max-age=0',
        'expires': result.headers.expires,
        'last-modified': 'Mon, 01 Jan 2018 00:00:00 GMT'
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('Text file no Last-Modified', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/no-last-modified' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'max-age=0',
        'expires': result.headers.expires
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('Text file no Cache-Control', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/no-cache-control' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('Text file custom Cache-Control', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/custom-cache-control' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-cache, no-store',
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('S3 file', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/s3' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'max-age=0',
        'expires': result.headers['expires'],
        'etag': '"ae771fbbba6a74eeeb77754355831713"',
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('S3 file w/ nested path', async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/s3path' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'max-age=0',
        'expires': result.headers['expires'],
        'etag': '"ae771fbbba6a74eeeb77754355831713"',
        'last-modified': result.headers['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('S3 file error',async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/s3missing' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'application/json',
        'x-error': 'true'
      }, statusCode: 500, body: '{"error":"NoSuchKey: The specified key does not exist."}', isBase64Encoded: false
    })
  }) // end it


  it('S3 bad path error',async function() {
    let _event = Object.assign({},event,{ path: '/sendfile/s3-bad-path' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({
      headers: {
        'content-type': 'application/json',
        'x-error': 'true'
      }, statusCode: 500, body: '{"error":"Invalid S3 path"}', isBase64Encoded: false
    })
  }) // end it

  after(function() {
    stub.restore()
  })

}) // end sendFile tests
