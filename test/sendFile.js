'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

const fs = require('fs') // Require Node.js file system

// Init API instance
const api = require('../index')({ version: 'v1.0', mimeTypes: { test: 'text/test' } })

// NOTE: Set test to true
api._test = true;

let event = {
  httpMethod: 'get',
  path: '/',
  body: {},
  headers: {
    'Content-Type': 'application/json'
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

api.get('/sendfile/err', function(req,res) {
  res.sendFile('./test-missing.txt', err => {
    if (err) {
      res.status(404).error('There was an error accessing the requested file')
    }
  })
})

api.get('/sendfile/test', function(req,res) {
  res.sendFile('test/test.txt' + (req.query.test ? req.query.test : ''), err => {

    if (err) {
      return Promise.try(() => {
        for(let i = 0; i<40000000; i++) {}
        return true
      }).then((x) => {
        res.status(501).error('Custom File Error')
        // throw('test error')
      })
    } else {
      return Promise.try(() => {
        for(let i = 0; i<40000000; i++) {}
        return true
      }).then((x) => {
        res.status(201)
      })
    }

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

// Error Middleware
api.use(function(err,req,res,next) {
  next()
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('SendFile Tests:', function() {

  it('Bad path', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/badpath' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 500, body: '{"error":"Invalid file"}', isBase64Encoded: false })
    })
  }) // end it

  it('Missing file', function() {
    let _event = Object.assign({},event,{ path: '/sendfile' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 500, body: '{"error":"ENOENT: no such file or directory, open \'./test-missing.txt\'"}', isBase64Encoded: false })
    })
  }) // end it



  it('Missing file with custom catch', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/err' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 404, body: '{"error":"There was an error accessing the requested file"}', isBase64Encoded: false })
    })
  }) // end it


  it('Text file w/ callback override (promise)', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/test' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'max-age=0',
          'Expires': result.headers.Expires,
          'Last-Modified': result.headers['Last-Modified']
        },
        statusCode: 201, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file error w/ callback override (promise)', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/test', queryStringParameters: { test: 'x' } })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 501, body: '{"error":"Custom File Error"}', isBase64Encoded: false })
    })
  }) // end it



  it('Buffer Input', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/buffer' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=0',
          'Expires': result.headers.Expires,
          'Last-Modified': result.headers['Last-Modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file w/ headers', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/headers' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'x-test': 'test',
          'x-timestamp': 1,
          'Cache-Control': 'max-age=0',
          'Expires': result.headers.Expires,
          'Last-Modified': result.headers['Last-Modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it

  it('Text file w/ headers (private cache)', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/headers-private' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'x-test': 'test',
          'x-timestamp': 1,
          'Cache-Control': 'private, max-age=0',
          'Expires': result.headers.Expires,
          'Last-Modified': result.headers['Last-Modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it

  it('Text file custom Last-Modified', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/last-modified' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'max-age=0',
          'Expires': result.headers.Expires,
          'Last-Modified': 'Mon, 01 Jan 2018 00:00:00 GMT'
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file no Last-Modified', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/no-last-modified' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'max-age=0',
          'Expires': result.headers.Expires
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file no Cache-Control', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/no-cache-control' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'Last-Modified': result.headers['Last-Modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


  it('Text file custom Cache-Control', function() {
    let _event = Object.assign({},event,{ path: '/sendfile/custom-cache-control' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store',
          'Last-Modified': result.headers['Last-Modified']
        }, statusCode: 200, body: 'VGVzdCBmaWxlIGZvciBzZW5kRmlsZQo=', isBase64Encoded: true })
    })
  }) // end it


}) // end HEADER tests
