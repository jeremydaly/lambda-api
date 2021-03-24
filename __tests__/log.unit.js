'use strict'

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
const api_customLogger = require('../index')({ version: 'v1.0', logger: {
  log: (x) => console.log(JSON.stringify(Object.assign(JSON.parse(x),{ LOGGER: true })))
} })
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

api_customLogger.get('/', (req,res) => {
  req.log.info('info message','second param')
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

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(5)
    expect(_log[0].level).toBe('info')
    expect(_log[4].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[4]).toHaveProperty('coldStart')
    expect(_log[4]).toHaveProperty('statusCode')
    expect(_log[4]).toHaveProperty('path')
    expect(_log[4]).toHaveProperty('ip')
    expect(_log[4]).toHaveProperty('ua')
    expect(_log[4]).toHaveProperty('version')
    expect(_log[4]).toHaveProperty('qs')
    expect(typeof _log[4].qs.test).toBe('string')
    expect(_log[4]).toHaveProperty('device')
    expect(_log[4]).toHaveProperty('country')
  }) // end it

  it('Multi-value support', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/', multiValueQueryStringParameters: { test: ['val1'] } })
    let result = await new Promise(r => api_multi.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(5)
    expect(_log[0].level).toBe('info')
    expect(_log[4].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[4]).toHaveProperty('coldStart')
    expect(_log[4]).toHaveProperty('statusCode')
    expect(_log[4]).toHaveProperty('path')
    expect(_log[4]).toHaveProperty('ip')
    expect(_log[4]).toHaveProperty('ua')
    expect(_log[4]).toHaveProperty('version')
    expect(_log[4]).toHaveProperty('qs')
    expect(Array.isArray(_log[4].qs.test)).toBe(true)
    expect(_log[4]).toHaveProperty('device')
    expect(_log[4]).toHaveProperty('country')
  }) // end it

  it('Multi-value support (no parameters)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/', multiValueQueryStringParameters: { } })
    let result = await new Promise(r => api_multi.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(5)
    expect(_log[0].level).toBe('info')
    expect(_log[4].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[4]).toHaveProperty('coldStart')
    expect(_log[4]).toHaveProperty('statusCode')
    expect(_log[4]).toHaveProperty('path')
    expect(_log[4]).toHaveProperty('ip')
    expect(_log[4]).toHaveProperty('ua')
    expect(_log[4]).toHaveProperty('version')
    expect(_log[4]).not.toHaveProperty('qs')
    expect(_log[4]).toHaveProperty('device')
    expect(_log[4]).toHaveProperty('country')
  }) // end it

  it('Default options (no logs in routes)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/test' })
    let result = await new Promise(r => api_default.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(0)
  }) // end it


  it('Custom level (debug)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/',  })
    let result = await new Promise(r => api_customLevel.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(6)
    expect(_log[0].level).toBe('debug')
    expect(_log[5].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[5]).toHaveProperty('coldStart')
    expect(_log[5]).toHaveProperty('statusCode')
    expect(_log[5]).toHaveProperty('path')
    expect(_log[5]).toHaveProperty('ip')
    expect(_log[5]).toHaveProperty('ua')
    expect(_log[5]).toHaveProperty('version')
    expect(_log[5]).toHaveProperty('device')
    expect(_log[5]).toHaveProperty('country')
  }) // end it


  it('Disable (via level setting)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_disableLevel.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(0)
  }) // end it


  it('Custom Message Label', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customMsgKey.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).not.toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('customKey')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('statusCode')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it


  it('Custom "custom" Label', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customCustomKey.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).not.toHaveProperty('custom')
    expect(_log[0]).toHaveProperty('customKey')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('statusCode')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it


  it('Disable Timer', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_noTimer.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).not.toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('statusCode')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it



  it('Disable Timestamp', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_noTimestamp.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).not.toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('statusCode')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it



  it('Custom Timestamp', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customTimestamp.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(typeof _log[0].time).toBe('string')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('statusCode')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it


  it('Enable access logs', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_accessLogs.run(_event,context,(e,res) => { r(res) }))
    let result2 = await new Promise(r => api_accessLogs.run(Object.assign(_event,{ path: '/test' }),context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(result2).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('access')
    expect(_log[1].level).toBe('access')
    // access log 1
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).not.toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[0]).toHaveProperty('coldStart')
    expect(_log[0]).toHaveProperty('path')
    expect(_log[0]).toHaveProperty('ip')
    expect(_log[0]).toHaveProperty('ua')
    expect(_log[0]).toHaveProperty('version')
    expect(_log[0]).toHaveProperty('device')
    expect(_log[0]).toHaveProperty('country')
    // access log 2
    expect(_log[1]).toHaveProperty('time')
    expect(_log[1]).toHaveProperty('id')
    expect(_log[1]).toHaveProperty('route')
    expect(_log[1]).not.toHaveProperty('msg')
    expect(_log[1]).toHaveProperty('timer')
    expect(_log[1]).toHaveProperty('remaining')
    expect(_log[1]).toHaveProperty('function')
    expect(_log[1]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it



  it('No access logs (never)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_noAccessLogs.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(1)
    expect(_log[0].level).toBe('info')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    // these should NOT exist
    expect(_log[0]).not.toHaveProperty('coldStart')
    expect(_log[0]).not.toHaveProperty('statusCode')
    expect(_log[0]).not.toHaveProperty('path')
    expect(_log[0]).not.toHaveProperty('ip')
    expect(_log[0]).not.toHaveProperty('ua')
    expect(_log[0]).not.toHaveProperty('version')
    expect(_log[0]).not.toHaveProperty('device')
    expect(_log[0]).not.toHaveProperty('country')
  }) // end it


  it('Nested objects', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_nested.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('context')
    expect(_log[0].context).toHaveProperty('remaining')
    expect(_log[0].context).toHaveProperty('function')
    expect(_log[0].context).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[0]).toHaveProperty('custom')
    expect(_log[0].custom).toHaveProperty('customMsg')
    // access log
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('statusCode')
    expect(_log[1]).toHaveProperty('req')
    expect(_log[1].req).toHaveProperty('path')
    expect(_log[1].req).toHaveProperty('ip')
    expect(_log[1].req).toHaveProperty('ua')
    expect(_log[1].req).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('res')
  }) // end it


  it('With detail per log', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_withDetail.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[0]).toHaveProperty('path')
    expect(_log[0]).toHaveProperty('ip')
    expect(_log[0]).toHaveProperty('ua')
    expect(_log[0]).toHaveProperty('version')
    expect(_log[0]).toHaveProperty('device')
    expect(_log[0]).toHaveProperty('country')

    expect(_log[1]).toHaveProperty('time')
    expect(_log[1]).toHaveProperty('id')
    expect(_log[1]).toHaveProperty('route')
    expect(_log[1]).toHaveProperty('timer')
    expect(_log[1]).toHaveProperty('remaining')
    expect(_log[1]).toHaveProperty('function')
    expect(_log[1]).toHaveProperty('memory')
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it


  it('Custom levels', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customLevels.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(_log).toHaveLength(4)
    expect(_log[0].level).toBe('testDebug')
    expect(_log[1].level).toBe('testInfo')
    expect(_log[2].level).toBe('trace')
    expect(_log[3].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('int')
    // access log
    expect(_log[3]).toHaveProperty('time')
    expect(_log[3]).toHaveProperty('id')
    expect(_log[3]).toHaveProperty('route')
    expect(_log[3]).toHaveProperty('timer')
    expect(_log[3]).toHaveProperty('remaining')
    expect(_log[3]).toHaveProperty('function')
    expect(_log[3]).toHaveProperty('memory')
    expect(_log[3]).toHaveProperty('coldStart')
    expect(_log[3]).toHaveProperty('path')
    expect(_log[3]).toHaveProperty('ip')
    expect(_log[3]).toHaveProperty('ua')
    expect(_log[3]).toHaveProperty('version')
    expect(_log[3]).toHaveProperty('device')
    expect(_log[3]).toHaveProperty('country')
  }) // end it


  it('Custom serializers', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customSerializers.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).not.toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('TEST_CUSTOM')
    expect(_log[0]).toHaveProperty('TEST_CONTEXT')
    expect(_log[0]).toHaveProperty('test')
    // access log
    expect(_log[1]).toHaveProperty('time')
    expect(_log[1]).not.toHaveProperty('id')
    expect(_log[1]).toHaveProperty('route')
    expect(_log[1]).toHaveProperty('timer')
    expect(_log[1]).toHaveProperty('remaining')
    expect(_log[1]).toHaveProperty('function')
    expect(_log[1]).toHaveProperty('memory')
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('TESTPATH')
    expect(_log[1]).toHaveProperty('STATUS')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it


  it('Custom data (array)', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/array' })
    let result = await new Promise(r => api_default.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('custom')
    // access log
    expect(_log[1]).toHaveProperty('time')
    expect(_log[1]).toHaveProperty('id')
    expect(_log[1]).toHaveProperty('route')
    expect(_log[1]).toHaveProperty('timer')
    expect(_log[1]).toHaveProperty('remaining')
    expect(_log[1]).toHaveProperty('function')
    expect(_log[1]).toHaveProperty('memory')
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
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
    expect(error.name).toBe('ConfigurationError')
    expect(error.message).toBe('Invalid level configuration')
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
    expect(error.name).toBe('ConfigurationError')
    expect(error.message).toBe('Invalid sampler configuration')
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
    expect(error.name).toBe('ConfigurationError')
    expect(error.message).toBe('Invalid route specified in rule')
  }) // end it


  it('Enable stack traces', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_showStackTrace.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 500,
      body: '{"error":"undefinedVar is not defined"}',
      isBase64Encoded: false
    })
    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('fatal')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')
    expect(_log[0]).toHaveProperty('stack')

    expect(_log[1]).toHaveProperty('time')
    expect(_log[1]).toHaveProperty('id')
    expect(_log[1]).toHaveProperty('route')
    expect(_log[1]).toHaveProperty('timer')
    expect(_log[1]).toHaveProperty('remaining')
    expect(_log[1]).toHaveProperty('function')
    expect(_log[1]).toHaveProperty('memory')
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it


  it('Custom Logger', async function() {
    console.log = logger
    let _event = Object.assign({},event,{ path: '/' })
    let result = await new Promise(r => api_customLogger.run(_event,context,(e,res) => { r(res) }))
    console.log = consoleLog

    expect(result).toEqual({
      multiValueHeaders: { 'content-type': ['application/json'] },
      statusCode: 200,
      body: 'done',
      isBase64Encoded: false
    })

    expect(_log).toHaveLength(2)
    expect(_log[0].level).toBe('info')
    expect(_log[1].level).toBe('access')
    // standard log
    expect(_log[0]).toHaveProperty('LOGGER')
    expect(_log[0]).toHaveProperty('time')
    expect(_log[0]).toHaveProperty('id')
    expect(_log[0]).toHaveProperty('route')
    expect(_log[0]).toHaveProperty('msg')
    expect(_log[0]).toHaveProperty('timer')
    expect(_log[0]).toHaveProperty('remaining')
    expect(_log[0]).toHaveProperty('function')
    expect(_log[0]).toHaveProperty('memory')
    expect(_log[0]).toHaveProperty('int')

    expect(_log[1]).toHaveProperty('LOGGER')
    expect(_log[1]).toHaveProperty('time')
    expect(_log[1]).toHaveProperty('id')
    expect(_log[1]).toHaveProperty('route')
    expect(_log[1]).toHaveProperty('timer')
    expect(_log[1]).toHaveProperty('remaining')
    expect(_log[1]).toHaveProperty('function')
    expect(_log[1]).toHaveProperty('memory')
    expect(_log[1]).toHaveProperty('coldStart')
    expect(_log[1]).toHaveProperty('path')
    expect(_log[1]).toHaveProperty('ip')
    expect(_log[1]).toHaveProperty('ua')
    expect(_log[1]).toHaveProperty('version')
    expect(_log[1]).toHaveProperty('device')
    expect(_log[1]).toHaveProperty('country')
  }) // end it

})
