'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })

// NOTE: Set test to true
api._test = true;

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
api.get('/test', function(req,res) {
  res.status(200).json({ method: 'get', status: 'ok' })
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

api.delete('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'delete', status: 'ok', param: req.params.test })
})

api.options('/test/:test', function(req,res) {
  // console.log(req)
  res.status(200).json({ method: 'options', status: 'ok', param: req.params.test })
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

api.options('/*', function(req,res) {
  res.status(200).json({ method: 'options', status: 'ok', path: '/*'})
})

// api.options('/test_options2/*', function(req,res) {
//   res.status(200).json({ method: 'options', status: 'ok', path: '/test_options2/*'})
// })

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Route Tests:', function() {

  /*****************/
  /*** GET Tests ***/
  /*****************/

  describe('GET', function() {

    it('Simple path: /test', function() {
      let _event = Object.assign({},event,{})

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok"}' })
      })
    }) // end it

    it('Simple path w/ trailing slash: /test/', function() {
      let _event = Object.assign({},event,{ path: '/test/' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok"}' })
      })
    }) // end it

    it('Path with parameter: /test/123', function() {
      let _event = Object.assign({},event,{ path: '/test/123' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123"}' })
      })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        //console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123","query":"321"}' })
      })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}' })
      })
    }) // end it


    it('Event path + querystring w/ trailing slash (this shouldn\'t happen with API Gateway)', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/?test=321', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        //console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123","query":"321"}' })
      })
    }) // end it

    it('Event path + querystring w/o trailing slash (this shouldn\'t happen with API Gateway)', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query?test=321', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        //console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","param":"123","query":"321"}' })
      })
    }) // end it


    it('Missing path: /not_found', function() {
      let _event = Object.assign({},event,{ path: '/not_found' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}' })
      })
    }) // end it

  }) // end GET tests


  /******************/
  /*** POST Tests ***/
  /******************/

  describe('POST', function() {

    it('Simple path: /test', function() {
      let _event = Object.assign({},event,{ httpMethod: 'post' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok"}' })
      })
    }) // end it

    it('Simple path w/ trailing slash: /test/', function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'post' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok"}' })
      })
    }) // end it

    it('Path with parameter: /test/123', function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'post' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","param":"123"}' })
      })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'post', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        //console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","param":"123","query":"321"}' })
      })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'post', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}' })
      })
    }) // end it

    it('With JSON body: /test/json', function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'post', body: { test: '123' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123"}}' })
      })
    }) // end it

    it('With stringified JSON body: /test/json', function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'post', body: JSON.stringify({ test: '123' }) })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123"}}' })
      })
    }) // end it

    it('With x-www-form-urlencoded body: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('With "x-www-form-urlencoded; charset=UTF-8" body: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('With x-www-form-urlencoded body and lowercase "Content-Type" header: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('With x-www-form-urlencoded body and mixed case "Content-Type" header: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'post', body: 'test=123&test2=456', headers: { 'CoNtEnt-TYPe': 'application/x-www-form-urlencoded' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"post","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('Missing path: /not_found', function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'post' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}' })
      })
    }) // end it

  }) // end POST tests


  /*****************/
  /*** PUT Tests ***/
  /*****************/

  describe('PUT', function() {

    it('Simple path: /test', function() {
      let _event = Object.assign({},event,{ httpMethod: 'put' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok"}' })
      })
    }) // end it

    it('Simple path w/ trailing slash: /test/', function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'put' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok"}' })
      })
    }) // end it

    it('Path with parameter: /test/123', function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'put' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","param":"123"}' })
      })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'put', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        //console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","param":"123","query":"321"}' })
      })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'put', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}' })
      })
    }) // end it


    it('With JSON body: /test/json', function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'put', body: { test: '123' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123"}}' })
      })
    }) // end it

    it('With stringified JSON body: /test/json', function() {
      let _event = Object.assign({},event,{ path: '/test/json', httpMethod: 'put', body: JSON.stringify({ test: '123' }) })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123"}}' })
      })
    }) // end it

    it('With x-www-form-urlencoded body: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('With "x-www-form-urlencoded; charset=UTF-8" body: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('With x-www-form-urlencoded body and lowercase "Content-Type" header: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it

    it('With x-www-form-urlencoded body and mixed case "Content-Type" header: /test/form', function() {
      let _event = Object.assign({},event,{ path: '/test/form', httpMethod: 'put', body: 'test=123&test2=456', headers: { 'CoNtEnt-TYPe': 'application/x-www-form-urlencoded' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"put","status":"ok","body":{"test":"123","test2":"456"}}' })
      })
    }) // end it


    it('Missing path: /not_found', function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'put' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}' })
      })
    }) // end it

  }) // end PUT tests

  /********************/
  /*** DELETE Tests ***/
  /********************/

  describe('DELETE', function() {

    it('Path with parameter: /test/123', function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'delete' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"delete","status":"ok","param":"123"}' })
      })
    }) // end it

    it('Path with multiple parameters: /test/123/456', function() {
      let _event = Object.assign({},event,{ path: '/test/123/456', httpMethod: 'delete' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"delete","status":"ok","params":{"test":"123","test2":"456"}}' })
      })
    }) // end it


    it('Missing path: /not_found', function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'delete' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}' })
      })
    }) // end it

  }) // end DELETE tests


  /*********************/
  /*** OPTIONS Tests ***/
  /*********************/

  describe('OPTIONS', function() {

    it('Simple path: /test', function() {
      let _event = Object.assign({},event,{ httpMethod: 'options' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok"}' })
      })
    }) // end it

    it('Simple path w/ trailing slash: /test/', function() {
      let _event = Object.assign({},event,{ path: '/test/', httpMethod: 'options' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok"}' })
      })
    }) // end it

    it('Path with parameter: /test/123', function() {
      let _event = Object.assign({},event,{ path: '/test/123', httpMethod: 'options' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","param":"123"}' })
      })
    }) // end it

    it('Path with parameter and querystring: /test/123/query/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query', httpMethod: 'options', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        //console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","param":"123","query":"321"}' })
      })
    }) // end it

    it('Path with multiple parameters and querystring: /test/123/query/456/?test=321', function() {
      let _event = Object.assign({},event,{ path: '/test/123/query/456', httpMethod: 'options', queryStringParameters: { test: '321' } })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","params":{"test":"123","test2":"456"},"query":"321"}' })
      })
    }) // end it

    it('Wildcard: /test_options', function() {
      let _event = Object.assign({},event,{ path: '/test_options', httpMethod: 'options' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/*"}' })
      })
    }) // end it

    it('Wildcard with parameter: /test_options2/123', function() {
      let _event = Object.assign({},event,{ path: '/test_options2/123', httpMethod: 'options' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/*"}' })
      })
    }) // end it

    // it('Nested Wildcard: /test_options2', function() {
    //   let _event = Object.assign({},event,{ path: '/test_options2/test', httpMethod: 'options' })
    //
    //   return new Promise((resolve,reject) => {
    //     api.run(_event,{},function(err,res) { resolve(res) })
    //   }).then((result) => {
    //     // console.log(result);
    //     expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 200, body: '{"method":"options","status":"ok","path":"/test_options2/*"}' })
    //   })
    // }) // end it

    it('Missing path: /not_found', function() {
      let _event = Object.assign({},event,{ path: '/not_found', httpMethod: 'options' })

      return new Promise((resolve,reject) => {
        api.run(_event,{},function(err,res) { resolve(res) })
      }).then((result) => {
        // console.log(result);
        expect(result).to.deep.equal({ headers: { 'Content-Type': 'application/json' }, statusCode: 404, body: '{"error":"Route not found"}' })
      })
    }) // end it

  }) // end DELETE tests

}) // end ROUTE tests
