'use strict';

const delay = ms => new Promise(res => setTimeout(res, ms))

const { gzipSync } = require('zlib')

// Init API instance
const api = require('../index')({ version: 'v1.0' })
const api2 = require('../index')({ version: 'v1.0' })
const api3 = require('../index')({ version: 'v1.0' })
const api4 = require('../index')({ version: 'v1.0' })
const api5 = require('../index')({ version: 'v1.0', logger: { access: 'never' } })
const api_errors = require('../index')({ version: 'v1.0' })
const api6 = require('../index')() // no props
const api7 = require('../index')({ version: 'v1.0', logger: { errorLogging: false } })
const api8 = require('../index')({ version: 'v1.0', logger: { access: 'never', errorLogging: true } })
const errors = require('../lib/errors');

// Init API with custom gzip serializer and base64
const api9 = require('../index')({
  version: 'v1.0',
  isBase64: true,
  headers: {
    'content-encoding': ['gzip']
  },
  serializer: body => {
    const json = JSON.stringify(Object.assign(body, { _custom: true, _base64: true }))
    return gzipSync(json).toString('base64')
  }
})

class CustomError extends Error {
  constructor(message, code) {
    super(message)
    this.name = this.constructor.name
    this.code = code
  }
}


let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'content-type': ['application/json']
  }
}

/******************************************************************************/
/***  DEFINE TEST MIDDLEWARE & ERRORS                                       ***/
/******************************************************************************/

api.use(function (req, res, next) {
  req.testMiddleware = '123'
  next()
});

api.use(function (err, req, res, next) {
  req.testError1 = '123'
  next()
});

api.use(function (err, req, res, next) {
  req.testError2 = '456'
  if (req.path === '/testErrorMiddleware') {
    res.header('Content-Type', 'text/plain')
    res.send('This is a test error message: ' + req.testError1 + '/' + req.testError2)
  } else {
    next()
  }
});

// Add error with promise/delay
api.use(async function (err, req, res, next) {
  if (req.route === '/testErrorPromise') {
    await delay(100);

    res.header('Content-Type', 'text/plain')
    res.send('This is a test error message: ' + req.testError1 + '/' + req.testError2)
  } else {
    next()
  }
});

const errorMiddleware1 = (err, req, res, next) => {
  req.errorMiddleware1 = true
  next()
}

const errorMiddleware2 = (err, req, res, next) => {
  req.errorMiddleware2 = true
  next()
}

const sendError = (err, req, res, next) => {
  res.type('text/plain').send('This is a test error message: ' + req.errorMiddleware1 + '/' + req.errorMiddleware2)
}

api2.use(errorMiddleware1, errorMiddleware2, sendError)

const returnError = (err, req, res, next) => {
  return 'this is an error: ' + (req.errorMiddleware1 ? true : false)
}

api3.use(returnError, errorMiddleware1)

const callError = (err, req, res, next) => {
  res.status(500).send('this is an error: ' + (req.errorMiddleware1 ? true : false))
  next()
}

api4.use(callError, errorMiddleware1)

api5.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(401)
  }
  next()
})

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/testError', function (req, res) {
  res.error('This is a test error message')
})

api.get('/testErrorThrow', function (req, res) {
  throw new Error('This is a test thrown error')
})

api.get('/testErrorSimulated', function (req, res) {
  res.status(405)
  res.json({ error: 'This is a simulated error' })
})

api.get('/testErrorMiddleware', function (req, res) {
  res.error('This test error message should be overridden')
})

api.get('/testErrorPromise', function (req, res) {
  res.error('This is a test error message')
})

api2.get('/testError', function (req, res) {
  res.status(500)
  res.error('This is a test error message')
})

api3.get('/testError', function (req, res) {
  res.error('This is a test error message')
})

api4.get('/testError', function (req, res) {
  res.error(403, 'This is a test error message')
})

api5.get('/testError', function (req, res) {
  res.error('This is a test error message')
})

api5.get('/testErrorThrow', function (req, res) {
  throw new Error('This is a test thrown error')
})

api5.get('/testErrorDetail', function (req, res) {
  res.error('This is a test error message', 'details')
})

api5.get('/testErrorCustom', function (req, res) {
  throw new CustomError('This is a custom error', 403)
})

api_errors.use(function (err, req, res, next) {
  res.send({ errorType: err.name })
});

api_errors.get('/fileError', (req, res) => {
  res.sendFile('s3://test')
})

api_errors.get('/fileErrorLocal', (req, res) => {
  res.sendFile('./missing.txt')
})

api_errors.get('/responseError', (req, res) => {
  res.redirect(310, 'http://www.google.com')
})

api6.get('/testError', function (req, res) {
  res.error('This is a test error message')
})

api7.get('/testErrorThrow', function (req, res) {
  throw new Error('This is a test thrown error')
})

api8.get('/testErrorThrow', function (req, res) {
  throw new Error('This is a test thrown error')
})

api9.get('/testErrorThrow', function (req, res) {
  throw new Error('This is a test thrown error')
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Error Handling Tests:', function () {
  // this.slow(300);

  describe('Standard', function () {

    it('Called Error', async function () {
      let _event = Object.assign({}, event, { path: '/testError' })
      let result = await new Promise(r => api.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test error message"}', isBase64Encoded: false })
    }) // end it

    it('Thrown Error', async function () {
      let _event = Object.assign({}, event, { path: '/testErrorThrow' })
      let result = await new Promise(r => api.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test thrown error"}', isBase64Encoded: false })
    }) // end it

    it('Simulated Error', async function () {
      let _event = Object.assign({}, event, { path: '/testErrorSimulated' })
      let result = await new Promise(r => api.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 405, body: '{"error":"This is a simulated error"}', isBase64Encoded: false })
    }) // end it

  })

  describe('Middleware', function () {

    it('Error Middleware', async function () {
      let _event = Object.assign({}, event, { path: '/testErrorMiddleware' })
      let result = await new Promise(r => api.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/plain'] }, statusCode: 500, body: 'This is a test error message: 123/456', isBase64Encoded: false })
    }) // end it

    it('Error Middleware w/ Promise', async function () {
      let _event = Object.assign({}, event, { path: '/testErrorPromise' })
      let result = await new Promise(r => api.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/plain'] }, statusCode: 500, body: 'This is a test error message: 123/456', isBase64Encoded: false })
    }) // end it

    it('Multiple error middlewares', async function () {
      let _event = Object.assign({}, event, { path: '/testError' })
      let result = await new Promise(r => api2.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/plain'] }, statusCode: 500, body: 'This is a test error message: true/true', isBase64Encoded: false })
    }) // end it

    it('Returned error from middleware (async)', async function () {
      let _event = Object.assign({}, event, { path: '/testError' })
      let result = await new Promise(r => api3.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 500, body: 'this is an error: false', isBase64Encoded: false })
    }) // end it

    it('Returned error from middleware (callback)', async function () {
      let _event = Object.assign({}, event, { path: '/testError' })
      let result = await new Promise(r => api4.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 500, body: 'this is an error: false', isBase64Encoded: false })
    }) // end it
  })

  describe('Error Types', function () {
    it('RouteError', async function () {
      let _event = Object.assign({}, event, { path: '/testx' })
      let result = await new Promise(r => api_errors.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 404, body: '{"errorType":"RouteError"}', isBase64Encoded: false })
    }) // end it

    it('RouteError.name', async function () {
      let Error$1 = errors.RouteError
      let error = new Error$1('This is a test error')
      expect(error.name).toEqual('RouteError')
    }) // end it

    it('MethodError', async function () {
      let _event = Object.assign({}, event, { path: '/fileError', httpMethod: 'put' })
      let result = await new Promise(r => api_errors.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 405, body: '{"errorType":"MethodError"}', isBase64Encoded: false })
    }) // end it

    it('MethodError.name', async function () {
      let Error$1 = errors.MethodError
      let error = new Error$1('This is a test error')
      expect(error.name).toEqual('MethodError')
    }) // end it

    it('FileError (s3)', async function () {
      let _event = Object.assign({}, event, { path: '/fileError' })
      let result = await new Promise(r => api_errors.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 500, body: '{"errorType":"FileError"}', isBase64Encoded: false })
    }) // end it

    it('FileError (local)', async function () {
      let _event = Object.assign({}, event, { path: '/fileErrorLocal' })
      let result = await new Promise(r => api_errors.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 500, body: '{"errorType":"FileError"}', isBase64Encoded: false })
    }) // end it

    it('FileError.name', async function () {
      let Error$1 = errors.FileError
      let error = new Error$1('This is a test error')
      expect(error.name).toEqual('FileError')
    }) // end it

    it('ResponseError', async function () {
      let _event = Object.assign({}, event, { path: '/responseError' })
      let result = await new Promise(r => api_errors.run(_event, {}, (e, res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {}, statusCode: 500, body: '{"errorType":"ResponseError"}', isBase64Encoded: false })
    }) // end it

    it('ResponseError.name', async function () {
      let Error$1 = errors.ResponseError
      let error = new Error$1('This is a test error')
      expect(error.name).toEqual('ResponseError')
    }) // end it

    it('ConfigurationError.name', async function () {
      let Error$1 = errors.ConfigurationError
      let error = new Error$1('This is a test error')
      expect(error.name).toEqual('ConfigurationError')
    }) // end it

    it('ApiError with string message', async function () {
      let _event = Object.assign({}, event, { path: '/testError' });
      let result = await new Promise(r => api5.run(_event, {}, (e, res) => { r(res) }));
      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 500,
        body: '{"error":"This is a test error message"}',
        isBase64Encoded: false
      });
    });

    it('ApiError with code and message', async function () {
      let _event = Object.assign({}, event, { path: '/testError' });
      let result = await new Promise(r => api4.run(_event, {}, (e, res) => { r(res) }));
      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 500,
        body: 'this is an error: false',
        isBase64Encoded: false
      });
    });

    it('ApiError with message and detail', async function () {
      let _event = Object.assign({}, event, { path: '/testErrorDetail' });
      let result = await new Promise(r => api5.run(_event, {}, (e, res) => { r(res) }));
      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 500,
        body: '{"error":"This is a test error message"}',
        isBase64Encoded: false
      });
    });

    it('ApiError properties', function () {
      const error = new errors.ApiError('test message', 403, { foo: 'bar' });
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('test message');
      expect(error.code).toBe(403);
      expect(error.detail).toEqual({ foo: 'bar' });
    });

    it('ApiError default code', function () {
      const error = new errors.ApiError('test message');
      expect(error.code).toBe(500);
    });
  })

  describe('Logging', function () {

    it('Thrown Error', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testErrorThrow' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api5.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test thrown error"}', isBase64Encoded: false })
      expect(_log.level).toBe('fatal')
      expect(_log.msg).toBe('This is a test thrown error')
    }) // end it


    it('API Error', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testError' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api5.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test error message"}', isBase64Encoded: false })
      expect(_log.level).toBe('error')
      expect(_log.msg).toBe('This is a test error message')
    }) // end it

    it('Error with Detail', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testErrorDetail' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api5.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test error message"}', isBase64Encoded: false })
      expect(_log.level).toBe('error')
      expect(_log.msg).toBe('This is a test error message')
      expect(_log.detail).toBe('details')
    }) // end it

    it('Custom Error', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testErrorCustom' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api5.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      // console.log(JSON.stringify(_log,null,2));
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 401, body: '{"error":"This is a custom error"}', isBase64Encoded: false })
      expect(_log.level).toBe('fatal')
      expect(_log.msg).toBe('This is a custom error')
    }) // end it


    it('Error, no props', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testError' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api6.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test error message"}', isBase64Encoded: false })
    }) // end it

    it('Should not log error if option logger.errorLogging is false', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testErrorThrow' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api7.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test thrown error"}', isBase64Encoded: false })
      expect(_log).toBe(undefined)
    })

    it('Should log error if option logger.errorLogging is true', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testErrorThrow' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api8.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 500, body: '{"error":"This is a test thrown error"}', isBase64Encoded: false })
      expect(_log.level).toBe('fatal')
      expect(_log.msg).toBe('This is a test thrown error')
    })

  })

  describe('base64 errors', function () {
    it('Should return errors with base64 encoding', async function () {
      let _log
      let _event = Object.assign({}, event, { path: '/testErrorThrow' })
      let logger = console.log
      console.log = log => { try { _log = JSON.parse(log) } catch (e) { _log = log } }
      let result = await new Promise(r => api9.run(_event, {}, (e, res) => { r(res) }))
      console.log = logger
      let body = gzipSync(`{"error":"This is a test thrown error","_custom":true,"_base64":true}`).toString('base64')
      expect(result).toEqual({ multiValueHeaders: { 'content-encoding': ['gzip'], 'content-type': ['application/json'] }, statusCode: 500, body, isBase64Encoded: true })
    })
  })
}) // end ERROR HANDLING tests
