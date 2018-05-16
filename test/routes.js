'use strict';

const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })
const api2 = require('../index')({ version: 'v1.0' })

// NOTE: Set test to true
api._test = true;
api2._test = true;

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  headers: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api.get('/', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
})

api2.get('/', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/test', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.patch('/test', function(req,res) {
  res.status(200).json({ method: 'patch', status: 'ok' })
})

api.get('/test_options', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/test_options2/:test', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.post('/test', function(req,res) {
  res.status(200).json({ method: 'post', status: 'ok' })
})

api.put('/test', function(req,res) {
  res.status(200).json({ method: 'put', status: 'ok' })
})

api.options('/test', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok' })
})

api.get('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'get', status: 'ok', param: req.params.test })
})

api.post('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'post', status: 'ok', param: req.params.test })
})

api.put('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'put', status: 'ok', param: req.params.test })
})

api.patch('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'patch', status: 'ok', param: req.params.test })
})

api.delete('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'delete', status: 'ok', param: req.params.test })
})

api.options('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'options', status: 'ok', param: req.params.test })
})

api.patch('/test/:test/:test2', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'patch', status: 'ok', params: req.params })
})

api.delete('/test/:test/:test2', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'delete', status: 'ok', params: req.params })
})

api.get('/test/:test/query', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'get', status: 'ok', param: req.params.test, query: req.query.test })
})

api.post('/test/:test/query', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'post', status: 'ok', param: req.params.test, query: req.query.test })
})

api.put('/test/:test/query', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'put', status: 'ok', param: req.params.test, query: req.query.test })
})

api.options('/test/:test/query', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok', param: req.params.test, query: req.query.test })
})

api.get('/test/:test/query/:test2', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok', params: req.params, query: req.query.test })
})

api.post('/test/:test/query/:test2', function(req,res) {
  res.status(200).json({ method: 'post', status: 'ok', params: req.params, query: req.query.test })
})

api.put('/test/:test/query/:test2', function(req,res) {
  res.status(200).json({ method: 'put', status: 'ok', params: req.params, query: req.query.test })
})

api.options('/test/:test/query/:test2', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok', params: req.params, query: req.query.test })
})

api.post('/test/json', function(req,res) {
  res.status(200).json({ method: 'post', status: 'ok', body: req.body })
})

api.post('/test/form', function(req,res) {
  res.status(200).json({ method: 'post', status: 'ok', body: req.body })
})

api.put('/test/json', function(req,res) {
  res.status(200).json({ method: 'put', status: 'ok', body: req.body })
})

api.put('/test/form', function(req,res) {
  res.status(200).json({ method: 'put', status: 'ok', body: req.body })
})

api.METHOD('TEST','/test/:param1/queryx', function(req,res) {
  res.status(200).json({ method: 'test', status: 'ok', body: req.body })
})

api.METHOD('TEST','/test_options2/:param1/test', function(req,res) {
  res.status(200).json({ method: 'test', status: 'ok', body: req.body })
})

api.options('/*', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok', path: '/*'})
})

api.options('/test_options2/*', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok', path: '/test_options2/*'})
})

api.options('/test_options2/:param1/*', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok', path: '/test_options2/:param1/*', params:req.params})
})

api.get('/override/head/request', (req,res) => {
  res.status(200).header('method','get').json({ method: 'get', path: '/override/head/request' })
})

api.head('/override/head/request', (req,res) => {
  res.status(200).header('method','head').json({ method: 'head', path: '/override/head/request' })
})

api.any('/any', (req,res) => {
  res.status(200).json({ method: req.method, path: '/any', anyRoute: true })
})

api.any('/any2', (req,res) => {
  res.status(200).json({ method: req.method, path: '/any2', anyRoute: true })
})

api.post('/any2', (req,res) => {
  res.status(200).json({ method: req.method, path: '/any2', anyRoute: false })
})

api.options('/anywildcard/test', (req,res) => {
  res.status(200).json({ method: req.method, path: '/anywildcard', anyRoute: true })
})

api.any('/anywildcard/*', (req,res) => {
  res.status(200).json({ method: req.method, path: '/anywildcard', anyRoute: true })
})

api.get('/head/override', (req,res) => {
  res.status(200).header('wildcard',false).json({ })
})

api.head('/head/*', (req,res) => {
  res.status(200).header('wildcard',true).json({ })
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Route Tests:', function() {

  /*****************/
  /*** GET Tests ***/
  /*****************/

  describe('GET', function() {

    it('Base path: /', async function() {
      let _event = Object.assign({},event,{ path: '/' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({
        headers: { 'content-type': 'application/json' },
        statusCode: 200,
        body: '{"method":"get","status":"ok"}',
        isBase64Encoded: false
      })
    }) // end it

    it('Simple path: /test', async function() {
      let _event = Object.assign({},event,{})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Simple path w/ trailing slash: /test/', async function() {
      let _event = Object.assign({},event,{ path: '/test/' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123","query":"321"}', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}', isBase64Encoded: false })
    }) // end it


    it('Event path + querystring w/ trailing slash (this shouldn\'t happen with API Gateway)', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/?test=321', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123","query":"321"}', isBase64Encoded: false })
    }) // end it

    it('Event path + querystring w/o trailing slash (this shouldn\'t happen with API Gateway)', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query?test=321', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123","query":"321"}', isBase64Encoded: false })
    }) // end it


    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found (new api instance)', async function() {
      let _event = Object.assign({},event,{ path: '/not_found' })
      let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

  }) // end GET tests


  /******************/
  /*** HEAD Tests ***/
  /******************/

  describe('HEAD', function() {

    it('Base path: /', async function() {
      let _event = Object.assign({},event,{ path: '/', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({
        headers: { 'content-type': 'application/json' },
        statusCode: 200,
        body: '',
        isBase64Encoded: false
      })
    }) // end it

    it('Simple path: /test', async function() {
      let _event = Object.assign({},event,{ httpMethod: 'head'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Simple path w/ trailing slash: /test/', async function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'head', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'head', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Event path + querystring w/ trailing slash (this shouldn\'t happen with API Gateway)', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/?test=321', httpMethod: 'head', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Event path + querystring w/o trailing slash (this shouldn\'t happen with API Gateway)', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query?test=321', httpMethod: 'head', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '', isBase64Encoded: false })
    }) // end it

    it('Override HEAD request', async function() {
      let _event = Object.assign({},event,{ path: '/override/head/request', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'method': 'head' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

    it('Wildcard HEAD request', async function() {
      let _event = Object.assign({},event,{ path: '/head/override', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json', 'wildcard': true }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it

  }) // end HEAD tests

  /******************/
  /*** POST Tests ***/
  /******************/

  describe('POST', function() {

    it('Simple path: /test', async function() {
      let _event = Object.assign({},event,{ httpMethod: 'post' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Simple path w/ trailing slash: /test/', async function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'post' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'post' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","param":"123"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'post', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","param":"123","query":"321"}', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'post', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}', isBase64Encoded: false })
    }) // end it

    it('With JSON body: /test/json', async function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'post', body: { test: '123' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123"}}', isBase64Encoded: false })
    }) // end it

    it('With stringified JSON body: /test/json', async function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'post', body: JSON.stringify({ test: '123' }) })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123"}}', isBase64Encoded: false })
    }) // end it

    it('With x-www-form-urlencoded body: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('With "x-www-form-urlencoded; charset=UTF-8" body: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('With x-www-form-urlencoded body and lowercase "Content-Type" header: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('With x-www-form-urlencoded body and mixed case "Content-Type" header: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'CoNtEnt-TYPe': 'application/x-www-form-urlencoded' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'post' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

  }) // end POST tests


  /*****************/
  /*** PUT Tests ***/
  /*****************/

  describe('PUT', function() {

    it('Simple path: /test', async function() {
      let _event = Object.assign({},event,{ httpMethod: 'put' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Simple path w/ trailing slash: /test/', async function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'put' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'put' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","param":"123"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'put', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","param":"123","query":"321"}', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'put', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}', isBase64Encoded: false })
    }) // end it


    it('With JSON body: /test/json', async function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'put', body: { test: '123' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123"}}', isBase64Encoded: false })
    }) // end it

    it('With stringified JSON body: /test/json', async function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'put', body: JSON.stringify({ test: '123' }) })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123"}}', isBase64Encoded: false })
    }) // end it

    it('With x-www-form-urlencoded body: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('With "x-www-form-urlencoded; charset=UTF-8" body: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('With x-www-form-urlencoded body and lowercase "Content-Type" header: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('With x-www-form-urlencoded body and mixed case "Content-Type" header: /test/form', async function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'CoNtEnt-TYPe': 'application/x-www-form-urlencoded' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'put' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

  }) // end PUT tests


  /********************/
  /*** PATCH Tests ***/
  /********************/

  describe('PATCH', function() {

    it('Simple path: /test', async function() {
      let _event = Object.assign({},event,{ path: '/test', httpMethod: 'patch'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"patch","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'patch' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"patch","status":"ok","param":"123"}', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters: /test/123/456', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/456', httpMethod: 'patch' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"patch","status":"ok","params":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'patch' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

  }) // end PATCH tests

  /********************/
  /*** DELETE Tests ***/
  /********************/

  describe('DELETE', function() {

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'delete' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"delete","status":"ok","param":"123"}', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters: /test/123/456', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/456', httpMethod: 'delete' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"delete","status":"ok","params":{"test":"123","test2":"456"}}', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'delete' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

  }) // end DELETE tests


  /*********************/
  /*** OPTIONS Tests ***/
  /*********************/

  describe('OPTIONS', function() {

    it('Simple path: /test', async function() {
      let _event = Object.assign({},event,{ httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Simple path w/ trailing slash: /test/', async function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter: /test/123', async function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","param":"123"}', isBase64Encoded: false })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'options', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","param":"123","query":"321"}', isBase64Encoded: false })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', async function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'options', queryStringParameters: { test: '321' } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}', isBase64Encoded: false })
    }) // end it

    it('Wildcard: /test_options', async function() {
      let _event = Object.assign({},event,{ path: '/test_options', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/*"}', isBase64Encoded: false })
    }) // end it

    it('Wildcard with path: /test_options2/123', async function() {
      let _event = Object.assign({},event,{ path: '/test_options2/123', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/test_options2/*"}', isBase64Encoded: false })
    }) // end it

    it('Wildcard with deep path: /test/param1/queryx', async function() {
      let _event = Object.assign({},event,{ path: '/test/param1/queryx', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/*"}', isBase64Encoded: false })
    }) // end it

    it('Nested Wildcard: /test_options2', async function() {
      let _event = Object.assign({},event,{ path: '/test_options2/test', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/test_options2/*"}', isBase64Encoded: false })
    }) // end it

    it('Nested Wildcard with parameters: /test_options2/param1/test', async function() {
      let _event = Object.assign({},event,{ path: '/test_options2/param1/test', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/test_options2/:param1/*","params":{"param1":"param1"}}', isBase64Encoded: false })
    }) // end it

    it('Missing path: /not_found', async function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'options' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}', isBase64Encoded: false })
    }) // end it

  }) // end OPTIONS tests



  /*********************/
  /*** ANY Tests ***/
  /*********************/

  describe('ANY', function() {

    it('GET request on ANY route', async function() {
      let _event = Object.assign({},event,{ path: '/any', httpMethod: 'get' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"GET","path":"/any","anyRoute":true}', isBase64Encoded: false })
    }) // end it

    it('POST request on ANY route', async function() {
      let _event = Object.assign({},event,{ path: '/any', httpMethod: 'post' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"POST","path":"/any","anyRoute":true}', isBase64Encoded: false })
    }) // end it

    it('PUT request on ANY route', async function() {
      let _event = Object.assign({},event,{ path: '/any', httpMethod: 'put' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"PUT","path":"/any","anyRoute":true}', isBase64Encoded: false })
    }) // end it

    it('DELETE request on ANY route', async function() {
      let _event = Object.assign({},event,{ path: '/any', httpMethod: 'delete' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"DELETE","path":"/any","anyRoute":true}', isBase64Encoded: false })
    }) // end it

    it('PATCH request on ANY route', async function() {
      let _event = Object.assign({},event,{ path: '/any', httpMethod: 'patch' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"PATCH","path":"/any","anyRoute":true}', isBase64Encoded: false })
    }) // end it

    it('HEAD request on ANY route', async function() {
      let _event = Object.assign({},event,{ path: '/any', httpMethod: 'head' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '', isBase64Encoded: false })
    }) // end it


    it('GET request on ANY route: /any2', async function() {
      let _event = Object.assign({},event,{ path: '/any2', httpMethod: 'get' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"GET","path":"/any2","anyRoute":true}', isBase64Encoded: false })
    }) // end it

    it('POST request that overrides ANY route: /any2', async function() {
      let _event = Object.assign({},event,{ path: '/any2', httpMethod: 'post' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"POST","path":"/any2","anyRoute":false}', isBase64Encoded: false })
    }) // end it

    it('GET request on ANY wildcard route: /anywildcard', async function() {
      let _event = Object.assign({},event,{ path: '/anywildcard/test', httpMethod: 'get' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"GET","path":"/anywildcard","anyRoute":true}', isBase64Encoded: false })
    }) // end it

  }) // end ANY tests



  describe('METHOD', function() {

    it('Invalid method (new api instance)', async function() {
      let _event = Object.assign({},event,{ path: '/', httpMethod: 'test' })
      let result = await new Promise(r => api2.run(_event,{},(e,res) => { r(res) }))
      expect(result).to.deep.equal({
        headers: { 'content-type': 'application/json' },
        statusCode: 405,
        body: '{"error":"Method not allowed"}',
        isBase64Encoded: false
      })
    }) // end it

  }) // end method tests

  describe('routes() (debug method)', function() {

    it('Sample routes', function() {
      // Create an api instance
      let api2 = require('../index')()
      api2.get('/', (req,res) => {})
      api2.post('/test', (req,res) => {})
      api2.put('/test/put', (req,res) => {})
      api2.delete('/test/:var/delete', (req,res) => {})

      expect(api2.routes()).to.deep.equal([
        [ 'GET', '/' ],
        [ 'POST', '/test' ],
        [ 'PUT', '/test/put' ],
        [ 'DELETE', '/test/:var/delete' ]
      ])
    }) // end it
  }) // end routes() test

}) // end ROUTE tests
