'use strict';

const Promise = require('bluebird') // Promise library
const expect = require('chai').expect // Assertion library

const utils = require('../utils')

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

  }) // end escapeHtml tests

}) // end UTILITY tests
