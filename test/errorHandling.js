'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })
const api2 = require('../index')({ version: 'v1.0' })
const api3 = require('../index')({ version: 'v1.0' })
const api4 = require('../index')({ version: 'v1.0' })
const api5 = require('../index')({ version: 'v1.0', logger: { access: 'never' }})

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  headers: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST MIDDLEWARE & ERRORS                                       ***/
/******************************************************************************/

api.use(function(req,res,next) {
  req.testMiddleware = '123'
  next()
});

api.use(function(err,req,res,next) {
  req.testError1 = '123'
  next()
});

api.use(function(err,req,res,next) {
  req.testError2 = '456'
  if (req.path === '/testErrorMiddleware') {
    res.header('Content-Type','text/plain')
    res.send('This is a test error message: ' + req.testError1 + '/' + req.testError2)
  } else {
    next()
  }
});

// Add error with promise/delay
api.use(function(err,req,res,next) {
  if (req.route === '/testErrorPromise') {
    let start = Date.now()
    Promise.delay(100).then((x) => {
      res.header('Content-Type','text/plain')
      res.send('This is a test error message: ' + req.testError1 + '/' + req.testError2)
    })
  } else {
    next()
  }
});

const errorMiddleware1 = (err,req,res,next) => {
  req.errorMiddleware1 = true
  next()
}

const errorMiddleware2 = (err,req,res,next) => {
  req.errorMiddleware2 = true
  next()
}

const sendError = (err,req,res,next) => {
  res.type('text/plain').send('This is a test error message: ' + req.errorMiddleware1 + '/' + req.errorMiddleware2)
}

api2.use(errorMiddleware1,errorMiddleware2,sendError)

const returnError = (err,req,res,next) => {
  return 'this is an error: ' + (req.errorMiddleware1 ? true : false)
}

api3.use(returnError,errorMiddleware1)

const callError = (err,req,res,next) => {
  res.status(500).send('this is an error: ' + (req.errorMiddleware1 ? true : false))
  next()
}

api4.use(callError,errorMiddleware1)

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/testError', function(req,res) {
  res.error('This is a test error message')
})

api.get('/testErrorThrow', function(req,res) {
  throw new Error('This is a test thrown error')
})

api.get('/testErrorSimulated', function(req,res) {
  res.status(405)
  res.json({ error: 'This is a simulated error' })
})

api.get('/testErrorMiddleware', function(req,res) {
  res.error('This test error message should be overridden')
})

api.get('/testErrorPromise', function(req,res) {
  res.error('This is a test error message')
})

api2.get('/testError', function(req,res) {
  res.status(500)
  res.error('This is a test error message')
})

api3.get('/testError', function(req,res) {
  res.error('This is a test error message')
})

api4.get('/testError', function(req,res) {
  res.error(403,'This is a test error message')
})

api5.get('/testError', function(req,res) {
  res.error('This is a test error message')
})

api5.get('/testErrorThrow', function(req,res) {
  throw new Error('This is a test thrown error')
})



/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Error Handling Tests:', function() {
  this.slow(300);

  describe('Standard', function() {

    it('Called Error', async function() {
      let _event = Object.assign({},event,{ path: '/testError'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 500, body: '{"error":"This is a test error message"}', isBase64Encoded: false })
    }) // end it

    it('Thrown Error', async function() {
      let _event = Object.assign({},event,{ path: '/testErrorThrow'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 500, body: '{"error":"This is a test thrown error"}', isBase64Encoded: false })
    }) // end it

    it('Simulated Error', async function() {
      let _event = Object.assign({},event,{ path: '/testErrorSimulated'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 405, body: '{"error":"This is a simulated error"}', isBase64Encoded: false })
    }) // end it

  })

  describe('Middleware', function() {

    it('Error Middleware', async function() {
      let _event = Object.assign({},event,{ path: '/testErrorMiddleware'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'text/plain' }, statusCode: 500, body: 'This is a test error message: 123/456', isBase64Encoded: false })
    }) // end it

    it('Error Middleware w/ Promise', async function() {
      let _event = Object.assign({},event,{ path: '/testErrorPromise'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'text/plain' }, statusCode: 500, body: 'This is a test error message: 123/456', isBase64Encoded: false })
    }) // end it

    it('Multiple error middlewares', async function() {
      let _event = Object.assign({},event,{ path: '/testError'})
      let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'text/plain' }, statusCode: 500, body: 'This is a test error message: true/true', isBase64Encoded: false })
    }) // end it

    it('Returned error from middleware (async)', async function() {
      let _event = Object.assign({},event,{ path: '/testError'})
      let result = await new Promise(r => api3.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { }, statusCode: 500, body: 'this is an error: false', isBase64Encoded: false })
    }) // end it

    it('Returned error from middleware (callback)', async function() {
      let _event = Object.assign({},event,{ path: '/testError'})
      let result = await new Promise(r => api4.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { }, statusCode: 500, body: 'this is an error: false', isBase64Encoded: false })
    }) // end it
  })


  describe('Logging', function() {

    it('Thrown Error', async function() {
      let _log
      let _event = Object.assign({},event,{ path: '/testErrorThrow'})
      let logger = console.log
      api._test = false
      console.log = log => { try { _log = JSON.parse(log) } catch(e) { _log = log } }
      let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
      api._test = true
      console.log = logger
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 500, body: '{"error":"This is a test thrown error"}', isBase64Encoded: false })
      expect(_log.level).to.equal('fatal')
      expect(_log.msg).to.equal('This is a test thrown error')
    }) // end it


    it('API Error', async function() {
      let _log
      let _event = Object.assign({},event,{ path: '/testError'})
      let logger = console.log
      api._test = false
      console.log = log => { try { _log = JSON.parse(log) } catch(e) { _log = log } }
      let result = await new Promise(r => api5.run(_event,{},(e,res) => { r(res) }))
      api._test = true
      console.log = logger
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 500, body: '{"error":"This is a test error message"}', isBase64Encoded: false })
      expect(_log.level).to.equal('error')
      expect(_log.msg).to.equal('This is a test error message')
    }) // end it

  })

}) // end ERROR HANDLING tests
