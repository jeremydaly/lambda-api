'use strict';

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
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Unit Tests:', function() {

  it('setRoute', async function() {
  //   let routes = {}
  //   api.setRoute(routes,'GET', { route: '/testPath' }, ['testPath'])
  //   api.setRoute(routes,'GET', { route: '/testPath/testx' }, ['testPath','testx'])
  //   expect(routes).toEqual({
  //     ROUTES: {
  //       testPath: {
  //         METHODS: {
  //           GET: { route: '/testPath' }
  //         },
  //         ROUTES: {
  //           testx: {
  //             METHODS: {
  //               GET: { route: '/testPath/testx' }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   })
  }) // end it


  // it('setRoute - null path', async function() {
  //   let routes = { testPath: null }
  //   api.setRoute(routes,{['_GET']: { route: '/testPath/testx' } },'testPath.testx')
  //   expect(routes).toEqual({ testPath: { testx: { _GET: { route: '/testPath/testx' } } } })
  // }) // end it
  //
  // it('setRoute - null single path', async function() {
  //   let routes = { testPath: null }
  //   api.setRoute(routes,{['_GET']: { route: '/testPath' } },['testPath'])
  //   expect(routes).toEqual({ testPath: { _GET: { route: '/testPath' } } })
  // }) // end it


}) // end UNIT tests
