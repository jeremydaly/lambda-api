'use strict';



// Init API instance
const api = require('../index')({ version: 'v1.0', base: '/v1' })

// NOTE: Set test to true
api._test = true;

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
api.get('/test', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'get', status: 'ok', param: req.params.test })
})

api.get('/test/test2/test3', function(req,res) {
  res.status(200).json({ path: req.path, method: 'get', status: 'ok' })
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Base Path Tests:', function() {

  it('Simple path with base: /v1/test', async function() {
    let _event = Object.assign({},event,{ path: '/v1/test' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
  }) // end it

  it('Path with base and parameter: /v1/test/123', async function() {
    let _event = Object.assign({},event,{ path: '/v1/test/123' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123"}', isBase64Encoded: false })
  }) // end it

  it('Nested path with base: /v1/test/test2/test3', async function() {
    let _event = Object.assign({},event,{ path: '/v1/test/test2/test3' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"path":"/v1/test/test2/test3","method":"get","status":"ok"}', isBase64Encoded: false })
  }) // end it

  it('Middleware stack is inherited for root path when basepathed', async function() {
    const testApi = require('../index')({ base: 'base-path' })
    testApi.use((req, res, next) => {
      req.middlewareState = {
        segments: req.path.split('/').filter(Boolean)
      }
      next()
    })
    testApi.use((req, res, next) => {
      req.middlewareState.trace = req.middlewareState.segments.join(':')
      res.header('x-middleware-trace', req.middlewareState.trace)
      next()
    })
    testApi.get('/', async req => ({
      status: 'ok',
      trace: req.middlewareState.trace,
      segmentCount: req.middlewareState.segments.length
    }))

    let _event = Object.assign({},event,{ path: '/base-path/' })
    let result = await new Promise(r => testApi.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({
      multiValueHeaders: {
        'content-type': ['application/json'],
        'x-middleware-trace': ['base-path']
      },
      statusCode: 200,
      body: '{"status":"ok","trace":"base-path","segmentCount":1}',
      isBase64Encoded: false
    })
  }) // end it

}) // end BASEPATH tests
