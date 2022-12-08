'use strict';

const delay = ms => new Promise(res => setTimeout(res, ms))

const fs = require('fs') // Require Node.js file system

// Require Sinon.js library
const sinon = require('sinon')

const S3 = require('../lib/s3-service') // Init S3 Service

// Init API instance
const api = require('../index')({ version: 'v1.0', mimeTypes: { test: 'text/test' } })

let event = {
  httpMethod: 'get',
  path: '/',
  body: {},
  multiValueHeaders: {
    'content-type': ['application/json']
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/download/badpath', function(req,res) {
  res.download()
})

api.get('/download', function(req,res) {
  res.download('./test-missing.txt')
})

api.get('/download/err', function(req,res) {
  res.download('./test-missing.txt', err => {
    if (err) {
      res.error(404,'There was an error accessing the requested file')
    }
  })
})

api.get('/download/test', function(req,res) {
  res.download('__tests__/test.txt' + (req.query.test ? req.query.test : ''), err => {

    // Return a promise
    return delay(100).then((x) => {
      if (err) {
        // set custom error code and message on error
        res.error(501,'Custom File Error')
      } else {
        // else set custom response code
        res.status(201)
      }
    })

  })
})

api.get('/download/buffer', function(req,res) {
  res.download(fs.readFileSync('__tests__/test.txt'), req.query.filename ? req.query.filename : undefined)
})

api.get('/download/headers', function(req,res) {
  res.download('__tests__/test.txt', {
    headers: { 'x-test': 'test', 'x-timestamp': 1 }
  })
})

api.get('/download/headers-private', function(req,res) {
  res.download('__tests__/test.txt', {
    headers: { 'x-test': 'test', 'x-timestamp': 1 },
    private: true
  })
})

api.get('/download/all', function(req,res) {
  res.download('__tests__/test.txt', 'test-file.txt', { private: true, maxAge: 3600000 }, err => { res.header('x-callback','true') })
})

api.get('/download/no-options', function(req,res) {
  res.download('__tests__/test.txt', 'test-file.txt', err => { res.header('x-callback','true') })
})

// S3 file
api.get('/download/s3', function(req,res) {

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

  res.download('s3://my-test-bucket/test.txt')
})

api.get('/download/s3path', function(req,res) {

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

  res.download('s3://my-test-bucket/test/test.txt')
})

api.get('/download/s3missing', function(req,res) {

  stub.withArgs({Bucket: 'my-test-bucket', Key: 'file-does-not-exist.txt'})
    .throws(new Error("NoSuchKey: The specified key does not exist."))

  res.download('s3://my-test-bucket/file-does-not-exist.txt')
})


// Error Middleware
api.use(function(err,req,res,next) {
  res.header('x-error','true')
  next()
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

let stub

describe('Download Tests:', function() {

  beforeEach(function() {
     // Stub getObjectAsync
    stub = sinon.stub(S3,'getObject')
  })

  it('Bad path', async function() {
    let _event = Object.assign({},event,{ path: '/download/badpath' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'x-error': ['true'] }, statusCode: 500, body: '{"error":"Invalid file"}', isBase64Encoded: false })
  }) // end it

  it('Missing file', async function() {
    let _event = Object.assign({},event,{ path: '/download' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'x-error': ['true'] }, statusCode: 500, body: '{"error":"No such file"}', isBase64Encoded: false })
  }) // end it

  it('Missing file with custom catch', async function() {
    let _event = Object.assign({},event,{ path: '/download/err' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'x-error': ['true'] }, statusCode: 404, body: '{"error":"There was an error accessing the requested file"}', isBase64Encoded: false })
  }) // end it

  it('Text file w/ callback override (promise)', async function() {
    let _event = Object.assign({},event,{ path: '/download/test' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires,
        'last-modified': result.multiValueHeaders['last-modified'],
        'content-disposition': ['attachment; filename="test.txt"']
      },
      statusCode: 201, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Text file error w/ callback override (promise)', async function() {
    let _event = Object.assign({},event,{ path: '/download/test', queryStringParameters: { test: 'x' } })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'x-error': ['true'] }, statusCode: 501, body: '{"error":"Custom File Error"}', isBase64Encoded: false })
  }) // end it

  it('Buffer Input (no filename)', async function() {
    let _event = Object.assign({},event,{ path: '/download/buffer' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires,
        'last-modified': result.multiValueHeaders['last-modified'],
        'content-disposition': ['attachment']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('Buffer Input (w/ filename)', async function() {
    let _event = Object.assign({},event,{ path: '/download/buffer', queryStringParameters: { filename: 'test.txt' } })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires,
        'last-modified': result.multiValueHeaders['last-modified'],
        'content-disposition': ['attachment; filename="test.txt"']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('Text file w/ headers', async function() {
    let _event = Object.assign({},event,{ path: '/download/headers' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'x-test': ['test'],
        'x-timestamp': [1],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires,
        'last-modified': result.multiValueHeaders['last-modified'],
        'content-disposition': ['attachment; filename="test.txt"']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('Text file w/ filename, options, and callback', async function() {
    let _event = Object.assign({},event,{ path: '/download/all' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'x-callback': ['true'],
        'cache-control': ['private, max-age=3600'],
        'expires': result.multiValueHeaders.expires,
        'last-modified': result.multiValueHeaders['last-modified'],
        'content-disposition': ['attachment; filename="test-file.txt"']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('Text file w/ filename and callback (no options)', async function() {
    let _event = Object.assign({},event,{ path: '/download/no-options' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'x-callback': ['true'],
        'cache-control': ['max-age=0'],
        'expires': result.multiValueHeaders.expires,
        'last-modified': result.multiValueHeaders['last-modified'],
        'content-disposition': ['attachment; filename="test-file.txt"']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it


  it('S3 file', async function() {
    let _event = Object.assign({},event,{ path: '/download/s3' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'cache-control': ['max-age=0'],
        'content-disposition': ['attachment; filename="test.txt"'],
        'expires': result.multiValueHeaders['expires'],
        'etag': ['"ae771fbbba6a74eeeb77754355831713"'],
        'last-modified': result.multiValueHeaders['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('S3 file w/ nested path', async function() {
    let _event = Object.assign({},event,{ path: '/download/s3path' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['text/plain'],
        'cache-control': ['max-age=0'],
        'content-disposition': ['attachment; filename="test.txt"'],
        'expires': result.multiValueHeaders['expires'],
        'etag': ['"ae771fbbba6a74eeeb77754355831713"'],
        'last-modified': result.multiValueHeaders['last-modified']
      }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true
    })
  }) // end it

  it('S3 file error', async function() {
    let _event = Object.assign({},event,{ path: '/download/s3missing' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'x-error': ['true']
      }, statusCode: 500, body: '{"error":"NoSuchKey: The specified key does not exist."}', isBase64Encoded: false
    })
  }) // end it

  afterEach(function() {
    stub.restore()
  })

}) // end download tests
