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

api.use(function (req, res, next) {
  console.log('HELLO FROM MIDDLEWARE')
  req.testMiddleware = "123";
  next();
});

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/
api.get("/", function(req, res) {
  res.status(200).json({
    testMiddleware: req.testMiddleware,
  })
});

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

  it('should return testMiddleware: 123 when calling the root path', async function() {
    let _event = Object.assign({},event,{ path: '/v1' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
  })

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

}) // end BASEPATH tests
