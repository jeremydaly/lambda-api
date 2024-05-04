'use strict';

// Init API instance

const api = require('../index')({
  version: 'v1.0',
  errorHeaderWhitelist: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
  ]
})

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'content-type': ['application/json']
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/
api.get('/test', function(req,res) {
  res.header('test','testVal')
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/testEmpty', function(req,res) {
  res.header('test')
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/testOverride', function(req,res) {
  res.header('Content-Type','text/html')
  res.status(200).send('<div>testHTML</div>')
})

api.get('/testAppend', function(req,res) {
  res.header('test','testVal1')
  res.header('test','testVal2',true)
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/testMulti', function(req,res) {
  res.header('test',['testVal1','testVal2'])
  res.status(200).json({ method: 'get', status: 'ok' })
})

api.get('/testHTML', function(req,res) {
  res.status(200).html('<div>testHTML</div>')
})

api.get('/testJSONP', function(req,res) {
  res.status(200).jsonp({ method: 'get', status: 'ok' })
})

api.get('/getHeader', function(req,res) {
  res.status(200).header('TestHeader','test')
  res.json({
    headers: res.getHeader(),
    getHeader: res.getHeader('testheader'),
    getHeaderCase: res.getHeader('coNtEnt-TyPe'),
    getHeaderMissing: res.getHeader('test') ? false : true,
    getHeaderEmpty: res.getHeader() ? false : true,
    getHeaders: res.getHeaders()
  })
})

api.get('/getHeaderArray', function(req,res) {
  res.status(200).header('TestHeader','test').header('TestHeader','test2',true)
  res.json({
    headers: res.getHeader(undefined,true),
    getHeader: res.getHeader('testheader',true),
    getHeaderCase: res.getHeader('coNtEnt-TyPe',true),
    getHeaderMissing: res.getHeader('test') ? false : true,
    getHeaderEmpty: res.getHeader() ? false : true,
    getHeaders: res.getHeaders(true)
  })
})

api.get('/hasHeader', function(req,res) {
  res.status(200).header('TestHeader','test')
  res.json({
    hasHeader: res.hasHeader('testheader'),
    hasHeaderCase: res.hasHeader('coNtEnt-TyPe'),
    hasHeaderMissing: res.hasHeader('test'),
    hasHeaderEmpty: res.hasHeader() ? false : true
  })
})

api.get('/setHeader', function(req,res) {
  res.status(200).header('TestHeader','test').setHeader('NewHeader','test')
  res.json({
    headers: res.getHeaders()
  })
});

api.get('/removeHeader', function(req,res) {
  res.status(200).header('TestHeader','test').header('NewHeader','test').removeHeader('testHeader')
  res.json({
    removeHeader: res.hasHeader('testheader') ? false : true,
    hasHeader: res.hasHeader('NewHeader')
  })
})

api.get('/whitelistHeaders', function(req,res) {
  res.status(200).header('TestStrippedHeader', 'RemoveMe')
  res.status(200).header('access-control-allow-methods', ['GET, OPTIONS'])
  res.status(200).header('access-control-allow-origin', ['example.com'])
  throw new Error('TestError')
})

api.get('/cors', function(req,res) {
  res.cors().json({})
})

api.get('/corsCustom', function(req,res) {
  res.cors({
    origin: 'example.com',
    methods: 'GET, OPTIONS',
    headers: 'Content-Type, Authorization',
    maxAge: 84000000,
    credentials: true,
    exposeHeaders: 'Content-Type'
  }).json({})
})

api.get('/corsOverride', function(req,res) {
  res.cors().cors({
    origin: 'example.com',
    credentials: true
  }).json({})
})

api.get('/corsOverride2', function(req,res) {
  res.cors().cors({
    methods: 'GET, PUT, POST'
  }).json({})
})

api.get('/auth', function(req,res) {
  res.json({
    auth: req.auth
  })
})

api.get('/cloudfront', (req,res) => {
  res.send({ clientType: req.clientType, clientCountry: req.clientCountry })
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Header Tests:', function() {

  describe('Standard Tests:', function() {
    it('New Header: /test -- test: testVal', async function() {
      let _event = Object.assign({},event,{})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: {
        'content-type': ['application/json'],
        'test': ['testVal']
      }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Empty Header - Default', async function() {
      let _event = Object.assign({},event,{ path: '/testEmpty' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'test': [''] }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Override Header: /testOveride -- Content-Type: text/html', async function() {
      let _event = Object.assign({},event,{ path: '/testOverride'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'] }, statusCode: 200, body: '<div>testHTML</div>', isBase64Encoded: false })
    }) // end it

    it('Append to Header: /testAppend (multi-header)', async function() {
      let _event = Object.assign({},event,{ path: '/testAppend'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'test': ['testVal1','testVal2'] }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Multi-value Header: /testMulti (multi-header)', async function() {
      let _event = Object.assign({},event,{ path: '/testMulti'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'test': ['testVal1','testVal2'] }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('Multi-value Header: /testMulti (null header)', async function() {
      let _event = Object.assign({},event,{ path: '/testMulti', multiValueHeaders: null })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'], 'test': ['testVal1','testVal2'] }, statusCode: 200, body: '{"method":"get","status":"ok"}', isBase64Encoded: false })
    }) // end it

    it('HTML Convenience Method: /testHTML', async function() {
      let _event = Object.assign({},event,{ path: '/testHTML'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['text/html'] }, statusCode: 200, body: '<div>testHTML</div>', isBase64Encoded: false })
    }) // end it

    it('JSONP Convenience Method: /testJSONP', async function() {
      let _event = Object.assign({},event,{ path: '/testJSONP'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: 'callback({"method":"get","status":"ok"})', isBase64Encoded: false })
    }) // end it


    it('Get Header (as string)', async function() {
      let _event = Object.assign({},event,{ path: '/getHeader'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'testheader': ['test']
        }, statusCode: 200,
        body: '{"headers":{"content-type":"application/json","testheader":"test"},"getHeader":"test","getHeaderCase":"application/json","getHeaderMissing":true,"getHeaderEmpty":false,"getHeaders":{"content-type":["application/json"],"testheader":["test"]}}',
        isBase64Encoded: false
      })
    }) // end it


    it('Get Header (as array)', async function() {
      let _event = Object.assign({},event,{ path: '/getHeaderArray'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'testheader': ['test','test2']
        }, statusCode: 200,
        body: '{"headers":{"content-type":["application/json"],"testheader":["test","test2"]},"getHeader":["test","test2"],"getHeaderCase":["application/json"],"getHeaderMissing":true,"getHeaderEmpty":false,"getHeaders":{"content-type":["application/json"],"testheader":["test","test2"]}}',
        isBase64Encoded: false
      })
    }) // end it

    it('Has Header', async function() {
      let _event = Object.assign({},event,{ path: '/hasHeader'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'testheader': ['test']
        }, statusCode: 200,
        body: '{"hasHeader":true,"hasHeaderCase":true,"hasHeaderMissing":false,"hasHeaderEmpty":false}',
        isBase64Encoded: false
      })
    }) // end it

    it('Set Header', async function() {
      let _event = Object.assign({},event,{ path: '/setHeader'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'testheader': ['test'],
          'newheader': ['test']
        }, statusCode: 200,
        body: "{\"headers\":{\"content-type\":[\"application/json\"],\"testheader\":[\"test\"],\"newheader\":[\"test\"]}}",
        isBase64Encoded: false
      })
    }) // end it

    it('Remove Header', async function() {
      let _event = Object.assign({},event,{ path: '/removeHeader'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'newheader': ['test']
        }, statusCode: 200,
        body: '{"removeHeader":true,"hasHeader":true}',
        isBase64Encoded: false
      })
    }) // end it

    it('Pass whitelisted headers on error', async function() {
      let _event = Object.assign({},event,{ path: '/whitelistHeaders'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'access-control-allow-methods': ['GET, OPTIONS'],
          'access-control-allow-origin': ['example.com'],
        }, statusCode: 500,
        body: '{"error":"TestError"}',
        isBase64Encoded: false
      })
    }) // end it

  }) // end Standard tests

  describe('CORS Tests:', function() {

    it('Add Default CORS Headers', async function() {
      let _event = Object.assign({},event,{ path: '/cors'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'access-control-allow-headers': ['Content-Type, Authorization, Content-Length, X-Requested-With'],
          'access-control-allow-methods': ['GET, PUT, POST, DELETE, OPTIONS'],
          'access-control-allow-origin': ['*']
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    }) // end it

    it('Add Custom CORS Headers', async function() {
      let _event = Object.assign({},event,{ path: '/corsCustom'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'access-control-allow-headers': ['Content-Type, Authorization'],
          'access-control-allow-methods': ['GET, OPTIONS'],
          'access-control-allow-origin': ['example.com'],
          'access-control-allow-credentials': ['true'],
          'access-control-expose-headers': ['Content-Type'],
          'access-control-max-age': ['84000']
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    }) // end it

    it('Override CORS Headers #1', async function() {
      let _event = Object.assign({},event,{ path: '/corsOverride'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'access-control-allow-headers': ['Content-Type, Authorization, Content-Length, X-Requested-With'],
          'access-control-allow-methods': ['GET, PUT, POST, DELETE, OPTIONS'],
          'access-control-allow-origin': ['example.com'],
          'access-control-allow-credentials': ['true']
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    }) // end it

    it('Override CORS Headers #2', async function() {
      let _event = Object.assign({},event,{ path: '/corsOverride2'})
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'access-control-allow-headers': ['Content-Type, Authorization, Content-Length, X-Requested-With'],
          'access-control-allow-methods': ['GET, PUT, POST'],
          'access-control-allow-origin': ['*']
        }, statusCode: 200,
        body: '{}',
        isBase64Encoded: false
      })
    }) // end it
  }) // end CORS tests


  describe('Authorization Tests:', function() {

    it('Bearer (OAuth2/JWT)', async function() {
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { authorization: ["Bearer XYZ"] } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"auth":{"type":"Bearer","value":"XYZ"}}', isBase64Encoded: false })
    }) // end it

    it('Digest', async function() {
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { authorization: ["Digest XYZ"] } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"auth":{"type":"Digest","value":"XYZ"}}', isBase64Encoded: false })
    }) // end it

    it('Basic Auth', async function() {
      let creds = Buffer.from('test:testing').toString('base64')
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { authorization: ["Basic " + creds] } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"auth":{"type":"Basic","value":"dGVzdDp0ZXN0aW5n","username":"test","password":"testing"}}', isBase64Encoded: false })
    }) // end it

    it('OAuth 1.0', async function() {
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { authorization: ['OAuth realm="Example", oauth_consumer_key="xyz", oauth_token="abc", oauth_version="1.0"'] } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{\"auth\":{\"type\":\"OAuth\",\"value\":\"realm=\\\"Example\\\", oauth_consumer_key=\\\"xyz\\\", oauth_token=\\\"abc\\\", oauth_version=\\\"1.0\\\"\",\"realm\":\"Example\",\"oauth_consumer_key\":\"xyz\",\"oauth_token\":\"abc\",\"oauth_version\":\"1.0\"}}', isBase64Encoded: false })
    }) // end it

    it('Missing Authorization Header', async function() {
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"auth":{"type":"none","value":null}}', isBase64Encoded: false })
    }) // end it

    it('Invalid Schema', async function() {
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { authorization: ["Test XYZ"] } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"auth":{"type":"none","value":null}}', isBase64Encoded: false })
    }) // end it

    it('Incomplete Header', async function() {
      let _event = Object.assign({},event,{ path: '/auth', multiValueHeaders: { authorization: ["Bearer"] } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({ multiValueHeaders: { 'content-type': ['application/json'] }, statusCode: 200, body: '{"auth":{"type":"none","value":null}}', isBase64Encoded: false })
    }) // end it

  }) // end Auth tests

  describe('CloudFront:', function() {

    it('clientType (desktop)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {
        'CloudFront-Is-Desktop-Viewer': ['true'],
        'CloudFront-Is-Mobile-Viewer': ['false'],
        'CloudFront-Is-SmartTV-Viewer': ['false'],
        'CloudFront-Is-Tablet-Viewer': ['false'],
        'CloudFront-Viewer-Country': ['US']
      } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"desktop","clientCountry":"US"}',
        isBase64Encoded: false })
    }) // end it

    it('clientType (mobile)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {
        'CloudFront-Is-Desktop-Viewer': ['false'],
        'CloudFront-Is-Mobile-Viewer': ['true'],
        'CloudFront-Is-SmartTV-Viewer': ['false'],
        'CloudFront-Is-Tablet-Viewer': ['false'],
        'CloudFront-Viewer-Country': ['US']
      } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"mobile","clientCountry":"US"}',
        isBase64Encoded: false })
    }) // end it

    it('clientType (tv)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {
        'CloudFront-Is-Desktop-Viewer': ['false'],
        'CloudFront-Is-Mobile-Viewer': ['false'],
        'CloudFront-Is-SmartTV-Viewer': ['true'],
        'CloudFront-Is-Tablet-Viewer': ['false'],
        'CloudFront-Viewer-Country': ['US']
      } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"tv","clientCountry":"US"}',
        isBase64Encoded: false })
    }) // end it

    it('clientType (tablet)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {
        'CloudFront-Is-Desktop-Viewer': ['false'],
        'CloudFront-Is-Mobile-Viewer': ['false'],
        'CloudFront-Is-SmartTV-Viewer': ['false'],
        'CloudFront-Is-Tablet-Viewer': ['true'],
        'CloudFront-Viewer-Country': ['US']
      } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"tablet","clientCountry":"US"}',
        isBase64Encoded: false })
    }) // end it

    it('clientType (unknown)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {
        'CloudFront-Is-Desktop-Viewer': ['false'],
        'CloudFront-Is-Mobile-Viewer': ['false'],
        'CloudFront-Is-SmartTV-Viewer': ['false'],
        'CloudFront-Is-Tablet-Viewer': ['false'],
        'CloudFront-Viewer-Country': ['US']
      } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"unknown","clientCountry":"US"}',
        isBase64Encoded: false })
    }) // end it

    it('clientType (unknown - missing headers)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {} })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"unknown","clientCountry":"unknown"}',
        isBase64Encoded: false })
    }) // end it

    it('clientCountry (UK)', async function() {
      let _event = Object.assign({},event,{ path: '/cloudfront', multiValueHeaders: {
        'CloudFront-Is-Desktop-Viewer': ['false'],
        'CloudFront-Is-Mobile-Viewer': ['false'],
        'CloudFront-Is-SmartTV-Viewer': ['false'],
        'CloudFront-Is-Tablet-Viewer': ['false'],
        'CloudFront-Viewer-Country': ['uk']
      } })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))

      expect(result).toEqual({
        multiValueHeaders: { 'content-type': ['application/json'] },
        statusCode: 200,
        body: '{"clientType":"unknown","clientCountry":"UK"}',
        isBase64Encoded: false })
    }) // end it

  })

}) // end HEADER tests
