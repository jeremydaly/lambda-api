'use strict';

const expect = require('chai').expect // Assertion library

const prettyPrint = require('../lib/prettyPrint')

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('PrettyPrint Tests:', function() {
  it('Minimum header widths', function() {
    expect(prettyPrint([['GET','/'],['POST','/'],['DELETE','/']])).to.equal('╔══════════╤═════════╗\n║  \u001b[1mMETHOD\u001b[0m  │  \u001b[1mROUTE\u001b[0m  ║\n╟──────────┼─────────╢\n║  GET     │  /      ║\n╟──────────┼─────────╢\n║  POST    │  /      ║\n╟──────────┼─────────╢\n║  DELETE  │  /      ║\n╚══════════╧═════════╝')
  }) // end it

  it('Adjusted header widths', function() {
    expect(prettyPrint([['GET','/'],['POST','/testing'],['DELETE','/long-url-path-name']])).to.equal('╔══════════╤═══════════════════════╗\n║  \u001b[1mMETHOD\u001b[0m  │  \u001b[1mROUTE              \u001b[0m  ║\n╟──────────┼───────────────────────╢\n║  GET     │  /                    ║\n╟──────────┼───────────────────────╢\n║  POST    │  /testing             ║\n╟──────────┼───────────────────────╢\n║  DELETE  │  /long-url-path-name  ║\n╚══════════╧═══════════════════════╝')
  }) // end it

}) // end UTILITY tests
