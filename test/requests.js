'use strict';

const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/
api.get('/test/hello', function(req,res) {
  let request = Object.assign(req,{app:null})
  // console.log(JSON.stringify(request,null,2));
  res.cookie('test','value')
  res.cookie('test2','value2')
  res.status(200).json({ request })
})

api.get('/test/201', function(req,res) {
  let request = Object.assign(req,{app:null})
  res.status(201).json({ request })
})



/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Request Tests:', function() {

  describe('API Gateway Proxy Event', function() {
    it('Standard event', async function() {
      let _event = require('./sample-event-apigateway1.json')
      let _context = require('./sample-context-apigateway1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(body);
      // console.log(body.request.multiValueHeaders);
      expect(result.multiValueHeaders).to.deep.equal({ 'content-type': ['application/json'], 'set-cookie': ['test=value; Path=/','test2=value2; Path=/'] })
      expect(body).to.have.property('request')
      expect(body.request.id).is.not.null
      expect(body.request.interface).to.equal('apigateway')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.1')
      expect(body.request.pathParameters).to.deep.equal({ "proxy": "hello" })
      expect(body.request.stageVariables).to.deep.equal({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).to.equal(false)
      expect(body.request.clientType).to.equal('desktop')
      expect(body.request.clientCountry).to.equal('US')
      expect(body.request.route).to.equal('/test/hello')
      expect(body.request.query.qs1).to.equal('foo')
      expect(body.request.query.qs2).to.equal('bar')
      expect(body.request.multiValueQuery.qs2).to.deep.equal(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).to.deep.equal(['bat','baz'])
      expect(body.request.headers['test-header']).to.equal('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).to.deep.equal(['val1','val2'])
    })

    it('Missing X-Forwarded-For (sourceIp fallback)', async function() {
      let _event = require('./sample-event-apigateway1.json')
      let _context = require('./sample-context-apigateway1.json')
      delete _event.headers['X-Forwarded-For'] // remove the header
      delete _event.multiValueHeaders['x-forwarded-for'] // remove the header
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      expect(result.multiValueHeaders).to.deep.equal({ 'content-type': ['application/json'], 'set-cookie': ['test=value; Path=/','test2=value2; Path=/'] })
      expect(body).to.have.property('request')
      expect(body.request.id).is.not.null
      expect(body.request.interface).to.equal('apigateway')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.12')
      expect(body.request.pathParameters).to.deep.equal({ "proxy": "hello" })
      expect(body.request.stageVariables).to.deep.equal({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).to.equal(false)
      expect(body.request.clientType).to.equal('desktop')
      expect(body.request.clientCountry).to.equal('US')
      expect(body.request.route).to.equal('/test/hello')
      expect(body.request.query.qs1).to.equal('foo')
      expect(body.request.query.qs2).to.equal('bar')
      expect(body.request.multiValueQuery.qs2).to.deep.equal(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).to.deep.equal(['bat','baz'])
      expect(body.request.headers['test-header']).to.equal('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).to.deep.equal(['val1','val2'])
      // console.log(body);
    })
  })

  describe('ALB Event', function() {
    it('Standard event', async function() {
      let _event = require('./sample-event-alb1.json')
      let _context = require('./sample-context-alb1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(JSON.stringify(result,null,2));
      expect(result.headers).to.deep.equal({ 'content-type': 'application/json', 'set-cookie': 'test2=value2; Path=/' })
      expect(body).to.have.property('request')
      expect(body.request.id).is.not.null
      expect(body.request.interface).to.equal('alb')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.1')
      expect(body.request.isBase64Encoded).to.equal(true)
      expect(body.request.clientType).to.equal('unknown')
      expect(body.request.clientCountry).to.equal('unknown')
      expect(body.request.route).to.equal('/test/hello')
      expect(body.request.query.qs1).to.equal('foo')
      expect(body.request.multiValueQuery.qs1).to.deep.equal(['foo'])
    })


    it('With multi-value support', async function() {
      let _event = require('./sample-event-alb2.json')
      let _context = require('./sample-context-alb1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(JSON.stringify(result,null,2));
      expect(result.multiValueHeaders).to.deep.equal({ 'content-type': ['application/json'], 'set-cookie': ['test=value; Path=/','test2=value2; Path=/'] })
      expect(body).to.have.property('request')
      expect(body.request.id).is.not.null
      expect(body.request.interface).to.equal('alb')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.1')
      expect(body.request.isBase64Encoded).to.equal(true)
      expect(body.request.clientType).to.equal('unknown')
      expect(body.request.clientCountry).to.equal('unknown')
      expect(body.request.route).to.equal('/test/hello')
      expect(body.request.query.qs1).to.equal('foo')
      expect(body.request.multiValueQuery.qs1).to.deep.equal(['foo'])
      expect(body.request.multiValueQuery.qs2).to.deep.equal(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).to.deep.equal(['foo','bar','bat'])
      expect(body.request.headers['test-header']).to.equal('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).to.deep.equal(['val1','val2'])
    })


    it('Alternate statuss code', async function() {
      let _event = Object.assign(require('./sample-event-alb2.json'),{ path: '/test/201' })
      let _context = require('./sample-context-alb1.json')
      let result = await new Promise(r => api.run(_event,_context,(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      // console.log(JSON.stringify(result,null,2));
      expect(result.multiValueHeaders).to.deep.equal({ 'content-type': ['application/json'] })
      expect(result.statusDescription).to.equal('201 Created')
      expect(body).to.have.property('request')
      expect(body.request.id).is.not.null
      expect(body.request.interface).to.equal('alb')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.1')
      expect(body.request.isBase64Encoded).to.equal(true)
      expect(body.request.clientType).to.equal('unknown')
      expect(body.request.clientCountry).to.equal('unknown')
      expect(body.request.route).to.equal('/test/201')
      expect(body.request.query.qs1).to.equal('foo')
      expect(body.request.multiValueQuery.qs1).to.deep.equal(['foo'])
      expect(body.request.multiValueQuery.qs2).to.deep.equal(['foo','bar'])
      expect(body.request.multiValueQuery.qs3).to.deep.equal(['foo','bar','bat'])
      expect(body.request.headers['test-header']).to.equal('val1,val2')
      expect(body.request.multiValueHeaders['test-header']).to.deep.equal(['val1','val2'])
    })

  })

}) // end Request tests
