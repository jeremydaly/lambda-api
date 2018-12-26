'use strict'

const expect = require('chai').expect // Assertion library

// Init API instance
const api_default = require('../index')({ logger: true }) // default logger
const api_multi = require('../index')({ logger: { multiValue: true } })
const api_customLevel = require('../index')({ version: 'v1.0', logger: { level: 'debug' } })
const api_disableLevel = require('../index')({ version: 'v1.0', logger: { level: 'none' } })
const api_customMsgKey = require('../index')({ version: 'v1.0', logger: { messageKey: 'customKey' } })
const api_customCustomKey = require('../index')({ version: 'v1.0', logger: { customKey: 'customKey' } })
const api_noTimer = require('../index')({ version: 'v1.0', logger: { timer: false } })
const api_noTimestamp = require('../index')({ version: 'v1.0', logger: { timestamp: false } })
const api_customTimestamp = require('../index')({ version: 'v1.0', logger: { timestamp: () => new Date().toUTCString() } })
const api_accessLogs = require('../index')({ version: 'v1.0', logger: { access: true } })
const api_noAccessLogs = require('../index')({ version: 'v1.0', logger: { access: 'never' } })
const api_nested = require('../index')({ version: 'v1.0', logger: { nested: true, access: true } })
const api_withDetail = require('../index')({ version: 'v1.0', logger: { detail: true } })
const api_showStackTrace = require('../index')({ version: 'v1.0', logger: { stack: true } })
const api_customLevels = require('../index')({ version: 'v1.0', logger: {
  levels: {
    testDebug: 35,
    testInfo: 30,
    trace: 90
  }
} })
const api_customSerializers = require('../index')({ version: 'v1.0', logger: {
  serializers: {
    main: (req) => {
      return {
        account: req.requestContext.accountId || 'no account',
        id: undefined
      }
    },
    req: (req) => {
      return {
        'TESTPATH': req.path,
        method: undefined
      }
    },
    res: (res) => {
      return {
        'STATUS': res._statusCode
      }
    },
    context: (context) => {
      return {
        'TEST_CONTEXT': true
      }
    },
    custom: (custom) => {
      return {
        'TEST_CUSTOM': true
      }
    }
  }
} })


// Define default event
let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'content-type': ['application/json'],
    'x-forwarded-for': ['12.34.56.78, 23.45.67.89'],
    'user-agent': ['user-agent-string'],
    'cloudfront-is-desktop-viewer': ['false'],
    'cloudfront-is-mobile-viewer': ['true'],
    'cloudfront-is-smarttv-viewer': ['false'],
    'cloudfront-is-tablet-viewer': ['false'],
    'cloudfront-viewer-country': ['US']
  }
}

// Default context
let context = {
  awsRequestId: 'AWSREQID',
  functionName: 'testFunc',
  memoryLimitInMB: 2048,
  getRemainingTimeInMillis: () => 5000
}


/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api_default.get('/', (req,res) => {
  req.log.trace('trace message')
  req.log.debug('debug message')
  req.log.info('info message')
  req.log.warn('warn message')
  req.log.error('error message')
  req.log.fatal('fatal message')
  res.send('done')
})

api_multi.get('/', (req,res) => {
  req.log.trace('trace message')
  req.log.debug('debug message')
  req.log.info('info message')
  req.log.warn('warn message')
  req.log.error('error message')
  req.log.fatal('fatal message')
  res.send('done')
})

api_default.get('/test', (req,res) => {
  res.send('done')
})

api_customLevel.get('/', (req,res) => {
  req.log.trace('trace message')
  req.log.debug('debug message')
  req.log.info('info message')
  req.log.warn('warn message')
  req.log.error('error message')
  req.log.fatal('fatal message')
  res.send('done')
})

api_disableLevel.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_customMsgKey.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_customCustomKey.get('/', (req,res) => {
  req.log.info('info message','custom messsage')
  res.send('done')
})

api_noTimer.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_noTimestamp.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_customTimestamp.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_accessLogs.get('/', (req,res) => {
  res.send('done')
})

api_accessLogs.get('/test', (req,res) => {
  res.send('done')
})

api_noAccessLogs.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_nested.get('/', (req,res) => {
  req.log.info('info message',{ customMsg: 'custom message' })
  res.send('done')
})

api_withDetail.get('/', (req,res) => {
  req.log.info('info message')
  res.send('done')
})

api_customLevels.get('/', (req,res) => {
  req.log.testDebug('testDebug message')
  req.log.testInfo('testDebug message')
  req.log.trace('trace message - higher priority')
  res.send('done')
})

api_customSerializers.get('/', (req,res) => {
  req.log.info('info message',{test:true})
  res.send('done')
})

api_default.get('/array', (req,res) => {
  req.log.info('info message',['val1','val2','val3'])
  res.send('done')
})

api_showStackTrace.get('/', (req,res) => {
  undefinedVar // this should throw an error
  res.send('done')
})


/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Logging Tests:', function() {

  // Create a temporary logger to capture the console.log
  let _log = []
  let consoleLog = console.log
  const logger = (...logs) => {
    // console.info(...logs);
    let log
    try { log = JSON.parse(logs[0]) } catch(e) { }
    if (log && log.level) { _log.push(log) } else { console.info(...logs) }
  }

  // Clear the log before each test
  beforeEach(function() { _log = [] })


  it('Default options (logging: true)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/', multiValueQueryStringParameters: { test: ['val1'] } })
    let result = await new Promise(r => api_default.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(5)
    expect(_log[0].level).to.equal('info')
    expect(_log[4].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[4]).to.have.property('coldStart')
    expect(_log[4]).to.have.property('statusCode')
    expect(_log[4]).to.have.property('path')
    expect(_log[4]).to.have.property('ip')
    expect(_log[4]).to.have.property('ua')
    expect(_log[4]).to.have.property('version')
    expect(_log[4]).to.have.property('qs')
    expect(_log[4].qs.test).to.be.a('string')
    expect(_log[4]).to.have.property('device')
    expect(_log[4]).to.have.property('country')
  }) // end it

  it('Multi-value support', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/', multiValueQueryStringParameters: { test: ['val1'] } })
    let result = await new Promise(r => api_multi.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(5)
    expect(_log[0].level).to.equal('info')
    expect(_log[4].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[4]).to.have.property('coldStart')
    expect(_log[4]).to.have.property('statusCode')
    expect(_log[4]).to.have.property('path')
    expect(_log[4]).to.have.property('ip')
    expect(_log[4]).to.have.property('ua')
    expect(_log[4]).to.have.property('version')
    expect(_log[4]).to.have.property('qs')
    expect(_log[4].qs.test).to.be.a('array')
    expect(_log[4]).to.have.property('device')
    expect(_log[4]).to.have.property('country')
  }) // end it

  it('Default options (no logs in routes)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api_default.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(0)
  }) // end it


  it('Custom level (debug)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/',  })
    let result = await new Promise(r => api_customLevel.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(6)
    expect(_log[0].level).to.equal('debug')
    expect(_log[5].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[5]).to.have.property('coldStart')
    expect(_log[5]).to.have.property('statusCode')
    expect(_log[5]).to.have.property('path')
    expect(_log[5]).to.have.property('ip')
    expect(_log[5]).to.have.property('ua')
    expect(_log[5]).to.have.property('version')
    expect(_log[5]).to.have.property('device')
    expect(_log[5]).to.have.property('country')
  }) // end it


  it('Disable (via level setting)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_disableLevel.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(0)
  }) // end it


  it('Custom Message Label', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customMsgKey.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.not.have.property('msg')
    expect(_log[0]).to.have.property('customKey')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('statusCode')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


  it('Custom "custom" Label', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customCustomKey.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.not.have.property('custom')
    expect(_log[0]).to.have.property('customKey')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('statusCode')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


  it('Disable Timer', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_noTimer.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.not.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('statusCode')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it



  it('Disable Timestamp', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_noTimestamp.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.not.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('statusCode')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it



  it('Custom Timestamp', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customTimestamp.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0].time).to.be.a('string')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('statusCode')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


  it('Enable access logs', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_accessLogs.run(_event,context,(e,res) => { r(res) }))
    let result2 = await new Promise(r => api_accessLogs.run(Object.assign(_event,{ path: '/test' }),context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(result2).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('access')
    expect(_log[1].level).to.equal('access')
    // access log 1
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.not.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    expect(_log[0]).to.have.property('coldStart')
    expect(_log[0]).to.have.property('path')
    expect(_log[0]).to.have.property('ip')
    expect(_log[0]).to.have.property('ua')
    expect(_log[0]).to.have.property('version')
    expect(_log[0]).to.have.property('device')
    expect(_log[0]).to.have.property('country')
    // access log 2
    expect(_log[1]).to.have.property('time')
    expect(_log[1]).to.have.property('id')
    expect(_log[1]).to.have.property('route')
    expect(_log[1]).to.not.have.property('msg')
    expect(_log[1]).to.have.property('timer')
    expect(_log[1]).to.have.property('remaining')
    expect(_log[1]).to.have.property('function')
    expect(_log[1]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it



  it('No access logs (never)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_noAccessLogs.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(1)
    expect(_log[0].level).to.equal('info')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    // these should NOT exist
    expect(_log[0]).to.not.have.property('coldStart')
    expect(_log[0]).to.not.have.property('statusCode')
    expect(_log[0]).to.not.have.property('path')
    expect(_log[0]).to.not.have.property('ip')
    expect(_log[0]).to.not.have.property('ua')
    expect(_log[0]).to.not.have.property('version')
    expect(_log[0]).to.not.have.property('device')
    expect(_log[0]).to.not.have.property('country')
  }) // end it


  it('Nested objects', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_nested.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('context')
    expect(_log[0].context).to.have.property('remaining')
    expect(_log[0].context).to.have.property('function')
    expect(_log[0].context).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    expect(_log[0]).to.have.property('custom')
    expect(_log[0].custom).to.have.property('customMsg')
    // access log
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('statusCode')
    expect(_log[1]).to.have.property('req')
    expect(_log[1].req).to.have.property('path')
    expect(_log[1].req).to.have.property('ip')
    expect(_log[1].req).to.have.property('ua')
    expect(_log[1].req).to.have.property('version')
    expect(_log[1]).to.have.property('res')
  }) // end it


  it('With detail per log', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_withDetail.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    expect(_log[0]).to.have.property('path')
    expect(_log[0]).to.have.property('ip')
    expect(_log[0]).to.have.property('ua')
    expect(_log[0]).to.have.property('version')
    expect(_log[0]).to.have.property('device')
    expect(_log[0]).to.have.property('country')

    expect(_log[1]).to.have.property('time')
    expect(_log[1]).to.have.property('id')
    expect(_log[1]).to.have.property('route')
    expect(_log[1]).to.have.property('timer')
    expect(_log[1]).to.have.property('remaining')
    expect(_log[1]).to.have.property('function')
    expect(_log[1]).to.have.property('memory')
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


  it('Custom levels', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customLevels.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(_log).to.have.length(4)
    expect(_log[0].level).to.equal('testDebug')
    expect(_log[1].level).to.equal('testInfo')
    expect(_log[2].level).to.equal('trace')
    expect(_log[3].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('int')
    // access log
    expect(_log[3]).to.have.property('time')
    expect(_log[3]).to.have.property('id')
    expect(_log[3]).to.have.property('route')
    expect(_log[3]).to.have.property('timer')
    expect(_log[3]).to.have.property('remaining')
    expect(_log[3]).to.have.property('function')
    expect(_log[3]).to.have.property('memory')
    expect(_log[3]).to.have.property('coldStart')
    expect(_log[3]).to.have.property('path')
    expect(_log[3]).to.have.property('ip')
    expect(_log[3]).to.have.property('ua')
    expect(_log[3]).to.have.property('version')
    expect(_log[3]).to.have.property('device')
    expect(_log[3]).to.have.property('country')
  }) // end it


  it('Custom serializers', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customSerializers.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.not.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('int')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('TEST_CUSTOM')
    expect(_log[0]).to.have.property('TEST_CONTEXT')
    expect(_log[0]).to.have.property('test')
    // access log
    expect(_log[1]).to.have.property('time')
    expect(_log[1]).to.not.have.property('id')
    expect(_log[1]).to.have.property('route')
    expect(_log[1]).to.have.property('timer')
    expect(_log[1]).to.have.property('remaining')
    expect(_log[1]).to.have.property('function')
    expect(_log[1]).to.have.property('memory')
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('TESTPATH')
    expect(_log[1]).to.have.property('STATUS')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


  it('Custom data (array)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/array' })
    let result = await new Promise(r => api_default.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('info')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('int')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('custom')
    // access log
    expect(_log[1]).to.have.property('time')
    expect(_log[1]).to.have.property('id')
    expect(_log[1]).to.have.property('route')
    expect(_log[1]).to.have.property('timer')
    expect(_log[1]).to.have.property('remaining')
    expect(_log[1]).to.have.property('function')
    expect(_log[1]).to.have.property('memory')
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


  it('Invalid custom levels configuration', async function() {
    let error
    try {
      const api_error = require('../index')({ version: 'v1.0', logger: {
        levels: { '123': 'test '}
      } })
    } catch(e) {
      // console.log(e);
      error = e
    }
    expect(error.name).to.equal('ConfigurationError')
    expect(error.message).to.equal('Invalid level configuration')
  }) // end it


  it('Invalid sampler configuration', async function() {
    let error
    try {
      const api_error = require('../index')({ version: 'v1.0', logger: {
        sampling: 'test'
      } })
    } catch(e) {
      // console.log(e);
      error = e
    }
    expect(error.name).to.equal('ConfigurationError')
    expect(error.message).to.equal('Invalid sampler configuration')
  }) // end it


  it('Invalid sampler rule route', async function() {
    let error
    try {
      const api_error = require('../index')({ version: 'v1.0', logger: {
        sampling: {
          rules: [
            { target: 0, rate: 0 }
          ]
        }
      } })
    } catch(e) {
      // console.log(e);
      error = e
    }
    expect(error.name).to.equal('ConfigurationError')
    expect(error.message).to.equal('Invalid route specified in rule')
  }) // end it


  it('Enable stack traces', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_showStackTrace.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).to.deep.equal({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 500,
      body: '{"error":"undefinedVar is not defined"}',
      isBase64Encoded: false
    })
    expect(_log).to.have.length(2)
    expect(_log[0].level).to.equal('fatal')
    expect(_log[1].level).to.equal('access')
    // standard log
    expect(_log[0]).to.have.property('time')
    expect(_log[0]).to.have.property('id')
    expect(_log[0]).to.have.property('route')
    expect(_log[0]).to.have.property('msg')
    expect(_log[0]).to.have.property('timer')
    expect(_log[0]).to.have.property('remaining')
    expect(_log[0]).to.have.property('function')
    expect(_log[0]).to.have.property('memory')
    expect(_log[0]).to.have.property('int')
    expect(_log[0]).to.have.property('stack')

    expect(_log[1]).to.have.property('time')
    expect(_log[1]).to.have.property('id')
    expect(_log[1]).to.have.property('route')
    expect(_log[1]).to.have.property('timer')
    expect(_log[1]).to.have.property('remaining')
    expect(_log[1]).to.have.property('function')
    expect(_log[1]).to.have.property('memory')
    expect(_log[1]).to.have.property('coldStart')
    expect(_log[1]).to.have.property('path')
    expect(_log[1]).to.have.property('ip')
    expect(_log[1]).to.have.property('ua')
    expect(_log[1]).to.have.property('version')
    expect(_log[1]).to.have.property('device')
    expect(_log[1]).to.have.property('country')
  }) // end it


})
