'use strict';

// Init API instance
const api = require('../index')({ version: 'v1.0', logger: false })

let event = {
  httpMethod: 'get',
  path: '/',
  body: {},
  multiValueHeaders: {
    'content-type': ['application/json']
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

const middleware1 = (res,req,next) => { next() }
const middleware2 = (res,req,next) => { next() }
const middleware3 = (res,req,next) => { next() }
const middleware4 = (res,req,next) => { next() }
const getRoute = (res,req) => {}
const getRoute2 = (res,req) => {}
const getRoute3 = (res,req) => {}

// api.use((err,req,res,next) => {})
api.use(middleware1)
api.use(middleware2)
api.use('/test',middleware3)
api.get('/*',middleware4,getRoute2)
api.get('/test',getRoute3)
// api.get('/test/*',getRoute)
// api.get('/test/testx',getRoute3)

// api.use('/:test',middleware3)
// api.get('/', function baseGetRoute(req,res) {})
// api.get('/p1/p2/:paramName', function getRoute(req,res) {})
// api.get('/p1/p2', function getRoute(req,res,next) {})
// api.get('/p1/p2', function getRoute2(req,res) {})
// api.get('/p1/*', (req,res) => {})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Execution Stacks:', function() {
  it('test',()=>{})
}) // end ROUTE tests
