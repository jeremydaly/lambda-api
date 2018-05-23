'use strict';

const expect = require('chai').expect // Assertion library

const prettyPrint = require('../lib/prettyPrint')

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('PrettyPrint Tests:', function() {
  it('Execute', function() {
    expect(prettyPrint([['GET','/'],['POST','/'],['DELETE','/']])).to.equal(undefined)
  }) // end it

}) // end UTILITY tests
