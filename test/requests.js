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
  res.status(200).json({ request })
})



/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Request Tests:', function() {

  describe('API Gateway Proxy Event', function() {
    it('Standard event', async function() {
      let _event = require('./sample-event-apigateway1.json')
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      expect(result.headers).to.deep.equal({ 'content-type': 'application/json' })
      expect(body).to.have.property('request')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.1')
      expect(body.request.pathParameters).to.deep.equal({ "proxy": "hello" })
      expect(body.request.stageVariables).to.deep.equal({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).to.equal(false)
      expect(body.request.clientType).to.equal('desktop')
      expect(body.request.clientCountry).to.equal('US')
      expect(body.request.route).to.equal('/test/hello')
      // console.log(body);
    })

    it('Missing X-Forwarded-For (sourceIp fallback)', async function() {
      let _event = require('./sample-event-apigateway1.json')
      delete _event.headers['X-Forwarded-For'] // remove the header
      let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
      let body = JSON.parse(result.body)
      expect(result.headers).to.deep.equal({ 'content-type': 'application/json' })
      expect(body).to.have.property('request')
      expect(body.request.userAgent).to.equal('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48')
      expect(body.request).to.have.property('requestContext')
      expect(body.request.ip).to.equal('192.168.100.12')
      expect(body.request.pathParameters).to.deep.equal({ "proxy": "hello" })
      expect(body.request.stageVariables).to.deep.equal({ "stageVarName": "stageVarValue" })
      expect(body.request.isBase64Encoded).to.equal(false)
      expect(body.request.clientType).to.equal('desktop')
      expect(body.request.clientCountry).to.equal('US')
      expect(body.request.route).to.equal('/test/hello')
      // console.log(body);
    })
  })

}) // end Request tests
