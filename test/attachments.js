'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

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

api.get('/attachment', function(req,res) {
  res.attachment().send({ status: 'ok' })
})

api.get('/attachment/pdf', function(req,res) {
  res.attachment('/test/foo.pdf').send('filedata')
})

api.get('/attachment/png', function(req,res) {
  res.attachment('/test/foo.png').send('filedata')
})

api.get('/attachment/csv', function(req,res) {
  res.attachment('test/path/foo.csv').send('filedata')
})

api.get('/attachment/custom', function(req,res) {
  res.attachment('/test/path/foo.test').send('filedata')
})

api.get('/attachment/empty-string', function(req,res) {
  res.attachment(' ').send('filedata')
})

api.get('/attachment/null-string', function(req,res) {
  res.attachment(null).send('filedata')
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Attachment Tests:', function() {

  it('Simple attachment', function() {
    let _event = Object.assign({},event,{ path: '/attachment' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment', 'content-type': 'application/json' }, statusCode: 200, body: '{"status":"ok"}', isBase64Encoded: false })
    })
  }) // end it

  it('PDF attachment w/ path', function() {
    let _event = Object.assign({},event,{ path: '/attachment/pdf' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment; filename=\"foo.pdf\"', 'content-type': 'application/pdf' }, statusCode: 200, body: 'filedata', isBase64Encoded: false })
    })
  }) // end it

  it('PNG attachment w/ path', function() {
    let _event = Object.assign({},event,{ path: '/attachment/png' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment; filename=\"foo.png\"', 'content-type': 'image/png' }, statusCode: 200, body: 'filedata', isBase64Encoded: false })
    })
  }) // end it

  it('CSV attachment w/ path', function() {
    let _event = Object.assign({},event,{ path: '/attachment/csv' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment; filename=\"foo.csv\"', 'content-type': 'text/csv' }, statusCode: 200, body: 'filedata', isBase64Encoded: false })
    })
  }) // end it

  it('Custom MIME type attachment w/ path', function() {
    let _event = Object.assign({},event,{ path: '/attachment/custom' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment; filename=\"foo.test\"', 'content-type': 'text/test' }, statusCode: 200, body: 'filedata', isBase64Encoded: false })
    })
  }) // end it

  it('Empty string', function() {
    let _event = Object.assign({},event,{ path: '/attachment/empty-string' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment', 'content-type': 'application/json' }, statusCode: 200, body: 'filedata', isBase64Encoded: false })
    })
  }) // end it

  it('Null string', function() {
    let _event = Object.assign({},event,{ path: '/attachment/empty-string' })

    return new Promise((resolve,reject) => {
      api.run(_event,{},function(err,res) { resolve(res) })
    }).then((result) => {
      expect(result).to.deep.equal({ headers: { 'content-disposition': 'attachment', 'content-type': 'application/json' }, statusCode: 200, body: 'filedata', isBase64Encoded: false })
    })
  }) // end it

}) // end HEADER tests
