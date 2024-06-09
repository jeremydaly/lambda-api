'use strict';

// Init API instance
const api = require('../index')({ version: 'v1.0' })

// NOTE: Set test to true
api._test = true;

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

api.get('/cookie', function(req,res) {
  res.cookie('test','value').send({})
})

api.get('/cookieMultiple', function(req,res) {
  res.cookie('test','value').cookie('test2','value2').send({})
})

api.get('/cookieEncoded', function(req,res) {
  res.cookie('test','http:// [] foo;bar').send({})
})

api.get('/cookieObject', function(req,res) {
  res.cookie('test',{ foo: "bar" }).send({})
})

api.get('/cookieNonString', function(req,res) {
  res.cookie(123,'value').send({})
})

api.get('/cookieExpire', function(req,res) {
  res.cookie('test','value', { expires: new Date('January 1, 2019 00:00:00 GMT') }).send({})
})

api.get('/cookieMaxAge', function(req,res) {
  res.cookie('test','value', { maxAge: 60*60*1000 }).send({})
})

api.get('/cookieDomain', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieHttpOnly', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    httpOnly: true,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSecure', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    secure: true,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookiePath', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    secure: true,
    path: '/test',
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSameSiteTrue', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    sameSite: true,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSameSiteFalse', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    sameSite: false,
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieSameSiteString', function(req,res) {
  res.cookie('test','value', {
    domain: 'test.com',
    sameSite: 'Test',
    expires: new Date('January 1, 2019 00:00:00 GMT')
  }).send({})
})

api.get('/cookieParse', function(req,res) {
  res.send({ cookies: req.cookies })
})

api.get('/cookieClear', function(req,res) {
  res.clearCookie('test').send({})
})

api.get('/cookieClearOptions', function(req,res) {
  res.clearCookie('test', { domain: 'test.com', httpOnly: true, secure: true }).send({})
})

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Cookie Tests:', function() {

  describe("Set", function() {
    it('Basic Session Cookie', async function() {
      let _event = Object.assign({},event,{ path: '/cookie' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Basic Session Cookie (multi-header)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieMultiple' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Path=/','test2=value2; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Basic Session Cookie (encoded value)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieEncoded' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=http%3A%2F%2F%20%5B%5D%20foo%3Bbar; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it


    it('Basic Session Cookie (object value)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieObject' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=%7B%22foo%22%3A%22bar%22%7D; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it


    it('Basic Session Cookie (non-string name)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieNonString' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['123=value; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it


    it('Permanent Cookie (set expires)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieExpire' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set maxAge)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieMaxAge' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; MaxAge=3600; Expires='+ new Date(Date.now()+3600000).toUTCString() + '; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set domain)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieDomain' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set httpOnly)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieHttpOnly' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; HttpOnly; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set secure)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieSecure' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; Secure']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set path)', async function() {
      let _event = Object.assign({},event,{ path: '/cookiePath' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/test; Secure']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set sameSite - true)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieSameSiteTrue' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; SameSite=Strict']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set sameSite - false)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieSameSiteFalse' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; SameSite=Lax']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Permanent Cookie (set sameSite - string)', async function() {
      let _event = Object.assign({},event,{ path: '/cookieSameSiteString' })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=value; Domain=test.com; Expires=Tue, 01 Jan 2019 00:00:00 GMT; Path=/; SameSite=Test']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

  }) // end set tests


  describe("Parse", function() {

    it('Parse single cookie', async function() {
      let _event = Object.assign({},event,{
        path: '/cookieParse',
        multiValueHeaders: {
          cookie: ["test=some%20value"]
        }
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
        }, statusCode: 200, body: '{"cookies":{"test":"some value"}}', isBase64Encoded: false
      })
    }) // end it

    /**
     * There is no definitive standard on what the cookie value can contain.
     * The most restrictive definition I could find comes from Safari which only supports
     * the ASCII character set, excluding semi-colon, comma, backslash, and white space.
     * 
     * The % character is also ambiguous, as it is used as part of the URL encoded scheme. For the purpose of this test, we will leave this character out.
     * 
     * @see {@link https://stackoverflow.com/a/1969339 | This StackOverflow answer which provides more context regarding the cookie value}
     */
    it('Parse cookie with the entire supported set of ASCII characters', async function() {
      let asciiCharacterSet = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

      asciiCharacterSet = 
        asciiCharacterSet.replace(' ', '')
          .replace(';', '')
          .replace(',', '')
          .replace('/', '')
          .replace('%', '');

      let _event = Object.assign({},event,{
        path: '/cookieParse',
        multiValueHeaders: {
          cookie: [`test=${asciiCharacterSet}`]
        }
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(JSON.parse(result.body)).toEqual({
        cookies: {
          test: asciiCharacterSet,
        },
      })
    }) // end it

    it('Parse & decode two cookies', async function() {
      let _event = Object.assign({},event,{
        path: '/cookieParse',
        multiValueHeaders: {
          cookie: ["test=some%20value; test2=%7B%22foo%22%3A%22bar%22%7D"]
        }
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
        }, statusCode: 200, body: '{\"cookies\":{\"test\":\"some value\",\"test2\":{\"foo\":\"bar\"}}}', isBase64Encoded: false
      })
    }) // end it


    it('Parse & decode multiple cookies', async function() {
      let _event = Object.assign({},event,{
        path: '/cookieParse',
        multiValueHeaders: {
          cookie: ["test=some%20value; test2=%7B%22foo%22%3A%22bar%22%7D; test3=domain"]
        }
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
        }, statusCode: 200, body: '{\"cookies\":{\"test\":\"some value\",\"test2\":{\"foo\":\"bar\"},\"test3\":\"domain\"}}', isBase64Encoded: false
      })
    }) // end it

    it('Parse & decode multiple cookies with the entire supported set of ASCII characters', async function() {
      let asciiCharacterSet = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

      asciiCharacterSet = 
        asciiCharacterSet.replace(' ', '')
          .replace(';', '')
          .replace(',', '')
          .replace('/', '')
          .replace('%', '');

      let _event = Object.assign({},event,{
        path: '/cookieParse',
        multiValueHeaders: {
          cookie: [`test=${asciiCharacterSet}; test2=${asciiCharacterSet}`]
        }
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(JSON.parse(result.body)).toEqual({
        cookies: {
          test: asciiCharacterSet,
          test2: asciiCharacterSet,
        },
      })
    }) // end it

  }) // end parse tests

  describe("Clear", function() {

    it('Clear cookie (no options)', async function() {
      let _event = Object.assign({},event,{
        path: '/cookieClear'
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; MaxAge=-1; Path=/']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

    it('Clear cookie (w/ options)', async function() {
      let _event = Object.assign({},event,{
        path: '/cookieClearOptions'
      })
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      expect(result).toEqual({
        multiValueHeaders: {
          'content-type': ['application/json'],
          'set-cookie': ['test=; Domain=test.com; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; MaxAge=-1; Path=/; Secure']
        }, statusCode: 200, body: '{}', isBase64Encoded: false
      })
    }) // end it

  }) // end Clear tests

}) // end COOKIE tests
