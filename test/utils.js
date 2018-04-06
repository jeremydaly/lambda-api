'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

const utils = require('../lib/utils')

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Utility Function Tests:', function() {

  describe('escapeHtml:', function() {

    it('Escape &, <, >, ", and \'', function() {
      expect(utils.escapeHtml('&<>"\'')).to.equal('&amp;&lt;&gt;&quot;&#39;')
    }) // end it

  }) // end escapeHtml tests

  describe('encodeUrl:', function() {

    it('Unencoded with space in param', function() {
      expect(utils.encodeUrl('http://www.github.com/?foo=bar with space')).to.equal('http://www.github.com/?foo=bar%20with%20space')
    }) // end it

    it('Encoded URL with additional invalid sequence', function() {
      expect(utils.encodeUrl('http://www.github.com/?foo=bar%20with%20space%foo')).to.equal('http://www.github.com/?foo=bar%20with%20space%25foo')
    }) // end it

    it('Encode special characters, double encode, decode', function() {
      let url = 'http://www.github.com/?foo=шеллы'
      let encoded = utils.encodeUrl(url)
      let doubleEncoded = utils.encodeUrl(encoded)
      let decoded = decodeURI(encoded)
      expect(encoded).to.equal('http://www.github.com/?foo=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B')
      expect(doubleEncoded).to.equal('http://www.github.com/?foo=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B')
      expect(decoded).to.equal(url)
    }) // end it

  }) // end encodeUrl tests


  describe('encodeBody:', function() {

    it('String', function() {
      expect(utils.encodeBody('test string')).to.equal('test string')
    }) // end it

    it('Number', function() {
      expect(utils.encodeBody(123)).to.equal('123')
    }) // end it

    it('Array', function() {
      expect(utils.encodeBody([1,2,3])).to.equal('[1,2,3]')
    }) // end it

    it('Object', function() {
      expect(utils.encodeBody({ foo: 'bar' })).to.equal('{"foo":"bar"}')
    }) // end it

  }) // end encodeBody tests


  describe('parseBody:', function() {

    it('String', function() {
      expect(utils.parseBody('test string')).to.equal('test string')
    }) // end it

    it('Number', function() {
      expect(utils.parseBody('123')).to.equal(123)
    }) // end it

    it('Array', function() {
      expect(utils.parseBody('[1,2,3]')).to.deep.equal([ 1, 2, 3 ])
    }) // end it

    it('Object', function() {
      expect(utils.parseBody('{"foo":"bar"}')).to.deep.equal({ foo: 'bar' })
    }) // end it

  }) // end encodeBody tests


  describe('mimeLookup:', function() {

    it('.pdf', function() {
      expect(utils.mimeLookup('.pdf')).to.equal('application/pdf')
    }) // end it

    it('application/pdf', function() {
      expect(utils.mimeLookup('application/pdf')).to.equal('application/pdf')
    }) // end it

    it('application-x/pdf (non-standard w/ slash)', function() {
      expect(utils.mimeLookup('application-x/pdf')).to.equal('application-x/pdf')
    }) // end it

    it('xml', function() {
      expect(utils.mimeLookup('xml')).to.equal('application/xml')
    }) // end it

    it('.html', function() {
      expect(utils.mimeLookup('.html')).to.equal('text/html')
    }) // end it

    it('css', function() {
      expect(utils.mimeLookup('css')).to.equal('text/css')
    }) // end it

    it('jpg', function() {
      expect(utils.mimeLookup('jpg')).to.equal('image/jpeg')
    }) // end it

    it('.svg', function() {
      expect(utils.mimeLookup('.svg')).to.equal('image/svg+xml')
    }) // end it

    it('docx', function() {
      expect(utils.mimeLookup('docx')).to.equal('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }) // end it

    it('Custom', function() {
      expect(utils.mimeLookup('.mpeg', { mpeg: 'video/mpeg' })).to.equal('video/mpeg')
    }) // end it


  }) // end encodeBody tests


}) // end UTILITY tests
