'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

const fs = require('fs') // Require Node.js file system

// Require Sinon.js library
const sinon = require('sinon')

const AWS = require('aws-sdk') // AWS SDK (automatically available in Lambda)
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

api.get('/download/badpath', function(req,res) {
  res.download()
})

api.get('/download', function(req,res) {
  res.download('./test-missing.txt')
})

api.get('/download/err', function(req,res) {
  res.download('./test-missing.txt', err => {
    if (err) {
      res.status(404).error('There was an error accessing the requested file')
    }
  })
})

api.get('/download/test', function(req,res) {
  res.download('test/test.txt' + (req.query.test ? req.query.test : ''), err => {

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

api.get('/download/buffer', function(req,res) {
  res.download(fs.readFileSync('test/test.txt'), req.query.filename ? req.query.filename : undefined)
})

api.get('/download/headers', function(req,res) {
  res.download('test/test.txt', {
    headers: { 'x-test': 'test', 'x-timestamp': 1 }
  })
})

api.get('/download/headers-private', function(req,res) {
  res.download('test/test.txt', {
    headers: { 'x-test': 'test', 'x-timestamp': 1 },
    private: true
  })
})

api.get('/download/all', function(req,res) {
  res.download('test/test.txt', 'test-file.txt', { private: true, maxAge: 3600000 }, err => { res.header('x-callback','true') })
})

// S3 file
api.get('/download/s3', function(req,res) {

  stub.withArgs({Bucket: 'my-test-bucket', Key: 'test.txt'}).resolves({
    AcceptRanges: 'bytes',
    LastModified: new Date('2018-04-01T13:32:58.000Z'),
    ContentLength: 23,
    ETag: '"ae771fbbba6a74eeeb77754355831713"',
    ContentType: 'text/plain',
    Metadata: {},
    Body: Buffer.from('Test file for sendFile\n')
  })

  res.download('s3://my-test-bucket/test.txt')
})

api.get('/download/s3path', function(req,res) {

  stub.withArgs({Bucket: 'my-test-bucket', Key: 'test/test.txt'}).resolves({
    AcceptRanges: 'bytes',
    LastModified: new Date('2018-04-01T13:32:58.000Z'),
    ContentLength: 23,
    ETag: '"ae771fbbba6a74eeeb77754355831713"',
    ContentType: 'text/plain',
    Metadata: {},
    Body: Buffer.from('Test file for sendFile\n')
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

  before(function() {
     // Stub getObjectAsync
    stub = sinon.stub(S3,'getObject')
  })

  it('Bad path', function() {
    let _event = Object.assign({},event,{ path: '/download/badpath' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'x-error': 'true' }, statusCode: 500, body: '{"error":"Invalid file"}', isBase64Encoded: false })
    })
  }) // end it

  it('Missing file', function() {
    let _event = Object.assign({},event,{ path: '/download' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'x-error': 'true' }, statusCode: 500, body: '{"error":"ENOENT: no such file or directory, open \'./test-missing.txt\'"}', isBase64Encoded: false })
    })
  }) // end it



  it('Missing file with custom catch', function() {
    let _event = Object.assign({},event,{ path: '/download/err' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'x-error': 'true' }, statusCode: 404, body: '{"error":"There was an error accessing the requested file"}', isBase64Encoded: false })
    })
  }) // end it


  it('Text file w/ callback override (promise)', function() {
    let _event = Object.assign({},event,{ path: '/download/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'text/plain',
          'cache-control': 'max-age=0',
          'expires': result.headers.expires,
          'last-modified': result.headers['last-modified'],
          'content-disposition': 'attachment; filename="test.txt"'
        },
        statusCode: 201, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file error w/ callback override (promise)', function() {
    let _event = Object.assign({},event,{ path: '/download/test', queryStringParameters: { test: 'x' } })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'x-error': 'true' }, statusCode: 501, body: '{"error":"Custom File Error"}', isBase64Encoded: false })
    })
  }) // end it



  it('Buffer Input (no filename)', function() {
    let _event = Object.assign({},event,{ path: '/download/buffer' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'application/json',
          'cache-control': 'max-age=0',
          'expires': result.headers.expires,
          'last-modified': result.headers['last-modified'],
          'content-disposition': 'attachment'
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it



  it('Buffer Input (w/ filename)', function() {
    let _event = Object.assign({},event,{ path: '/download/buffer', queryStringParameters: { filename: 'test.txt' } })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'text/plain',
          'cache-control': 'max-age=0',
          'expires': result.headers.expires,
          'last-modified': result.headers['last-modified'],
          'content-disposition': 'attachment; filename="test.txt"'
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file w/ headers', function() {
    let _event = Object.assign({},event,{ path: '/download/headers' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'text/plain',
          'x-test': 'test',
          'x-timestamp': 1,
          'cache-control': 'max-age=0',
          'expires': result.headers.expires,
          'last-modified': result.headers['last-modified'],
          'content-disposition': 'attachment; filename="test.txt"'
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file w/ filename, options, and callback', function() {
    let _event = Object.assign({},event,{ path: '/download/all' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'text/plain',
          'x-callback': 'true',
          'cache-control': 'private, max-age=3600',
          'expires': result.headers.expires,
          'last-modified': result.headers['last-modified'],
          'content-disposition': 'attachment; filename="test-file.txt"'
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('S3 file', function() {
    let _event = Object.assign({},event,{ path: '/download/s3' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'text/plain',
          'cache-control': 'max-age=0',
          'content-disposition': 'attachment; filename="test.txt"',
          'expires': result.headers['expires'],
          'etag': '"ae771fbbba6a74eeeb77754355831713"',
          'last-modified': result.headers['last-modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it

  it('S3 file w/ nested path', function() {
    let _event = Object.assign({},event,{ path: '/download/s3path' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'text/plain',
          'cache-control': 'max-age=0',
          'content-disposition': 'attachment; filename="test.txt"',
          'expires': result.headers['expires'],
          'etag': '"ae771fbbba6a74eeeb77754355831713"',
          'last-modified': result.headers['last-modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it

  it('S3 file error', function() {
    let _event = Object.assign({},event,{ path: '/download/s3missing' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'content-type': 'application/json',
          'x-error': 'true'
        }, statusCode: 500, body: '{"error":"NoSuchKey: The specified key does not exist."}', isBase64Encoded: false })
    })
  }) // end it

  after(function() {
    stub.restore()
  })

}) // end download tests
