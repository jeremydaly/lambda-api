'use strict';

// Init API instance
const api = require('../index')({ version: 'v1.0' })

// Init API instance with direct Invoke support enabled
const apiDirect = require('../index')({ version: 'v1.0', directInvoke: true })

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/
api.get('/test/hello', function(req,res) {
  let request = Object.assign(req,{app:null})
  res.cookie('test','value')
  res.cookie('test2','value2')
  res.status(200).json({ request })
})

api.get('/test/201', function(req,res) {
  let request = Object.assign(req,{app:null})
  res.status(201).json({ request })
})

apiDirect.get('/test/hello', function(req,res) {
  let request = Object.assign(req,{app:null})
  res.status(200).json({ request })
})

apiDirect.get('/test/binary', function(req,res) {
  res.sendFile(Buffer.from('binary-data'))
})



/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Request Tests:', function() {

  describe('API Gateway Proxy Event v1', function() {
    it('Standard event', async function() {
      let _event = require('./sample-event-apigateway-v1.json')
      let _context = require('./sample-context-apigateway1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(body);
      // console.log(body.request.multiValueHeaders);
      expect(result.multiValueHeaders).toEqual({ 'content-type': ['application/json'], 'set-cookie': ['test=value; Path=/','test2=value2; Path=/'] })
      expect(body).toHaveProperty('request')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('apigateway')
      expect(body.request.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('192.168.100.1')
      expect(body.request.pathParameters).toEqual({ "proxy": "hello" })
      expect(body.request.stageVariables).toEqual({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).toBe(false)
      expect(body.request.clientType).toBe('desktop')
      expect(body.request.clientCountry).toBe('US')
      expect(body.request.route).toBe('/test/hello')
      expect(body.request.query.qs1).toBe('foo')
      expect(body.request.query.qs2).toBe('bar')
      expect(body.request.multiValueQuery.qs2).toEqual(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).toEqual(['bat','baz'])
      expect(body.request.headers['test-header']).toBe('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).toEqual(['val1','val2'])
    })

    it('Missing X-Forwarded-For (sourceIp fallback)', async function() {
      let _event = require('./sample-event-apigateway-v1.json')
      let _context = require('./sample-context-apigateway1.json')
      delete _event.headers['X-Forwarded-For'] // remove the header
      delete _event.multiValueHeaders['x-forwarded-for'] // remove the header
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      expect(result.multiValueHeaders).toEqual({ 'content-type': ['application/json'], 'set-cookie': ['test=value; Path=/','test2=value2; Path=/'] })
      expect(body).toHaveProperty('request')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('apigateway')
      expect(body.request.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('192.168.100.12')
      expect(body.request.pathParameters).toEqual({ "proxy": "hello" })
      expect(body.request.stageVariables).toEqual({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).toBe(false)
      expect(body.request.clientType).toBe('desktop')
      expect(body.request.clientCountry).toBe('US')
      expect(body.request.route).toBe('/test/hello')
      expect(body.request.query.qs1).toBe('foo')
      expect(body.request.query.qs2).toBe('bar')
      expect(body.request.multiValueQuery.qs2).toEqual(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).toEqual(['bat','baz'])
      expect(body.request.headers['test-header']).toBe('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).toEqual(['val1','val2'])
      // console.log(body);
    })
  })

  describe('API Gateway Proxy Event v2', function() {
    it('Standard event', async function() {
      let _event = require('./sample-event-apigateway-v2.json')
      let _context = require('./sample-context-apigateway1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(result);
      // console.log(body.request.multiValueHeaders);
      expect(result.cookies).toEqual(['test=value; Path=/','test2=value2; Path=/'])
      expect(body).toHaveProperty('request')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('apigateway')
      expect(body.request.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('192.168.100.1')
      expect(body.request.pathParameters).toEqual({ "proxy": "hello" })
      expect(body.request.stageVariables).toEqual({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).toBe(false)
      expect(body.request.clientType).toBe('desktop')
      expect(body.request.clientCountry).toBe('US')
      expect(body.request.route).toBe('/test/hello')
      expect(body.request.query.qs1).toBe('foo')
      expect(body.request.query.qs2).toBe('foo,bar')
      expect(body.request.multiValueQuery.qs2).toEqual(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).toEqual(['bat','baz'])
      expect(body.request.headers['test-header']).toBe('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).toEqual(['val1','val2'])
      expect(body.request.cookies).toEqual({ cookie1: 'test', cookie2: 123 })
    })
  })

  describe('ALB Event', function() {
    it('Standard event', async function() {
      let _event = require('./sample-event-alb1.json')
      let _context = require('./sample-context-alb1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(JSON.stringify(result,null,2));
      expect(result.headers).toEqual({ 'content-type': 'application/json', 'set-cookie': 'test2=value2; Path=/' })
      expect(body).toHaveProperty('request')
      expect(result.statusDescription).toBe('200 OK')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('alb')
      expect(body.request.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('192.168.100.1')
      expect(body.request.isBase64Encoded).toBe(true)
      expect(body.request.clientType).toBe('unknown')
      expect(body.request.clientCountry).toBe('unknown')
      expect(body.request.route).toBe('/test/hello')
      expect(body.request.query.qs1).toBe('foo')
      expect(body.request.multiValueQuery.qs1).toEqual(['foo'])
    })


    it('With multi-value support', async function() {
      let _event = require('./sample-event-alb2.json')
      let _context = require('./sample-context-alb1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(JSON.stringify(result,null,2));
      expect(result.multiValueHeaders).toEqual({ 'content-type': ['application/json'], 'set-cookie': ['test=value; Path=/','test2=value2; Path=/'] })
      expect(body).toHaveProperty('request')
      expect(result.statusDescription).toBe('200 OK')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('alb')
      expect(body.request.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('192.168.100.1')
      expect(body.request.isBase64Encoded).toBe(true)
      expect(body.request.clientType).toBe('unknown')
      expect(body.request.clientCountry).toBe('unknown')
      expect(body.request.route).toBe('/test/hello')
      expect(body.request.query.qs1).toBe('foo')
      expect(body.request.multiValueQuery.qs1).toEqual(['foo'])
      expect(body.request.multiValueQuery.qs2).toEqual(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).toEqual(['foo','bar','bat'])
      expect(body.request.headers['test-header']).toBe('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).toEqual(['val1','val2'])
    })


    it('Alternate status code', async function() {
      let _event = Object.assign(require('./sample-event-alb2.json'),{ path: '/test/201' })
      let _context = require('./sample-context-alb1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(JSON.stringify(result,null,2));
      expect(result.multiValueHeaders).toEqual({ 'content-type': ['application/json'] })
      expect(result.statusDescription).toBe('201 Created')
      expect(body).toHaveProperty('request')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('alb')
      expect(body.request.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('192.168.100.1')
      expect(body.request.isBase64Encoded).toBe(true)
      expect(body.request.clientType).toBe('unknown')
      expect(body.request.clientCountry).toBe('unknown')
      expect(body.request.route).toBe('/test/201')
      expect(body.request.query.qs1).toBe('foo')
      expect(body.request.multiValueQuery.qs1).toEqual(['foo'])
      expect(body.request.multiValueQuery.qs2).toEqual(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).toEqual(['foo','bar','bat'])
      expect(body.request.headers['test-header']).toBe('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).toEqual(['val1','val2'])
    })

  })

  describe('API Gateway Console Test', function() {
    // See: https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-test-method.html
    it('Standard event w/o multiValueHeaders', async function() {
      let _event = require('./sample-event-consoletest1.json')
      let _context = require('./sample-context-apigateway1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(body);
      // console.log(body.request.multiValueHeaders);
      expect(body).toHaveProperty('request')
      expect(body.request.id).toBeDefined()
      expect(body.request.interface).toBe('apigateway')
      expect(body.request).toHaveProperty('requestContext')
      expect(body.request.ip).toBe('test-invoke-source-ip')
      expect(body.request.pathParameters).toEqual({ "proxy": "test/hello" })
      expect(body.request.stageVariables).toEqual({})
      expect(body.request.isBase64Encoded).toBe(false)
      expect(body.request.clientType).toBe('unknown')
      expect(body.request.clientCountry).toBe('unknown')
      expect(body.request.route).toBe('/test/hello')
      expect(body.request.query).toEqual({})
      expect(body.request.multiValueQuery).toEqual({})
      expect(body.request.headers).toEqual({})
      // NOTE: body.request.multiValueHeaders is null in this case
    })

  })

  describe('Lambda Direct Invoke', function() {

    // NOTE: The 'Event' (async) invocation type needs no separate test — AWS
    // discards the function return value for async invokes, so the framework
    // behavior is identical to 'RequestResponse' from its side.

    it('Returns an unwrapped { statusCode, body } response', async function() {
      let _event = require('./sample-event-lambda1.json')
      let result = await new Promise(r => apiDirect.run(_event,{},(e,res) => { r(res) }))
      // Unwrapped shape: status + parsed body, no proxy envelope fields
      expect(result.statusCode).toBe(200)
      expect(typeof result.body).toBe('object')
      expect(result.headers).toBeUndefined()
      expect(result.multiValueHeaders).toBeUndefined()
      expect(result.isBase64Encoded).toBeUndefined()
      expect(result.statusDescription).toBeUndefined()
    })

    it('Detects the lambda interface and routes correctly', async function() {
      let _event = require('./sample-event-lambda1.json')
      let result = await new Promise(r => apiDirect.run(_event,{},(e,res) => { r(res) }))
      expect(result.body.request.interface).toBe('lambda')
      expect(result.body.request.method).toBe('GET')
      expect(result.body.request.route).toBe('/test/hello')
      expect(result.body.request.query.qs1).toBe('foo')
    })

    it('Returns an unwrapped error payload for unmatched routes', async function() {
      let _event = Object.assign({}, require('./sample-event-lambda1.json'), { path: '/nope' })
      let result = await new Promise(r => apiDirect.run(_event,{},(e,res) => { r(res) }))
      expect(result.statusCode).toBe(404)
      expect(result.body).toEqual({ error: 'Route not found' })
      expect(result.headers).toBeUndefined()
    })

    it('Preserves the base64 flag and raw body for binary responses', async function() {
      let _event = Object.assign({}, require('./sample-event-lambda1.json'), { path: '/test/binary' })
      let result = await new Promise(r => apiDirect.run(_event,{},(e,res) => { r(res) }))
      expect(result.statusCode).toBe(200)
      expect(result.isBase64Encoded).toBe(true)
      // Body stays the base64 string (not parsed) so the caller can decode it
      expect(typeof result.body).toBe('string')
      expect(Buffer.from(result.body, 'base64').toString()).toBe('binary-data')
      expect(result.headers).toBeUndefined()
    })

    it('Returns an empty body for HEAD requests', async function() {
      let _event = Object.assign({}, require('./sample-event-lambda1.json'), { httpMethod: 'HEAD' })
      let result = await new Promise(r => apiDirect.run(_event,{},(e,res) => { r(res) }))
      expect(result.statusCode).toBe(200)
      expect(result.body).toBe('')
      expect(result.isBase64Encoded).toBeUndefined()
      expect(result.headers).toBeUndefined()
    })

    it('Backward compat: directInvoke off keeps the API Gateway envelope', async function() {
      // Same requestContext-less event through the default api instance
      let _event = require('./sample-event-lambda1.json')
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      expect(typeof result.body).toBe('string')
      expect(result.headers).toBeDefined()
      expect(body.request.interface).toBe('apigateway')
    })

    it('Dual mode: directInvoke on still returns the envelope for API Gateway events', async function() {
      // API Gateway events carry a requestContext, so they keep the proxy envelope
      let _event = require('./sample-event-apigateway-v1.json')
      let _context = require('./sample-context-apigateway1.json')
      let result = await new Promise(r => apiDirect.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      expect(typeof result.body).toBe('string')
      expect(result.multiValueHeaders).toBeDefined()
      expect(body.request.interface).toBe('apigateway')
    })

  })

}) // end Request tests
