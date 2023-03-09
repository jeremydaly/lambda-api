'use strict'

const delay = ms => new Promise(res => setTimeout(res, ms))

let request = 1

// Init API instance
const api_default = require('../index')({ logger: { sampling: true } })
const api_rules = require('../index')({
  logger: {
    access: 'never',
    sampling: {
      rules: [
        { route: '/testNone',  target: 0, rate: 0, period: 1 },
        { route: '/testTarget',  target: 3, rate: 0, period: 1 },
        { route: '/testTargetRate',  target: 0, rate: 0.2, period: 1 },
        { route: '/testTargetMethod',  target: 1, rate: 0.2, period: 1, method:'get,put' },
        { route: '/testTargetMethod',  target: 2, rate: 0.1, period: 2, method:['Post','DELETE'], level:'info' },
        { route: '/testParam/:param',  target: 10, level: 'debug' },
        { route: '/testParam/:param/deep', target: 20, level: 'info' },
        { route: '/testWildCard/*',  target: 30, level: 'debug' },
        { route: '/testWildCard/test', target: 40, level: 'debug', method: 'Any' },
        { route: '/testWildCardMethod/*',  target: 50, level: 'debug', method:'get' }
      ],
      target: 1,
      rate: 0.1,
      period: 1
    }
  }
})
const api_basePathRules = require('../index')({
  logger: {
    access: false,
    sampling: {
      rules: [
        { route: '/',  target: 0, rate: 0, period: 5, method: 'get' },
      ],
      target: 1,
      rate: 0.1,
      period: 5
    }
  }
})



// Define default event
let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  multiValueHeaders: {
    'content-type': ['application/json'],
    'x-forwarded-for': ['12.34.56.78, 23.45.67.89'],
    'User-Agent': ['user-agent-string']
  }
}

// Default context
let context = {
  awsRequestId: 'AWSREQID',
  functionName: 'testFunc',
  memoryLimitInMB: '2048',
  getRemainingTimeInMillis: () => 5000
}


/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

api_rules.get('/', (req,res) => {
  req.log.trace('request #'+request++)
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testNone', (req,res) => {
  req.log.trace('request #'+request++)
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testTarget', (req,res) => {
  req.log.trace('request #'+request++)
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testTargetRate', (req,res) => {
  req.log.trace('request #'+request++)
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testTargetMethod', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.post('/testTargetMethod', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testParam/:param', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testParam/:param/deep', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testWildCard/test', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testWildCard/other', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testWildCard/other/deep', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})

api_rules.get('/testWildCardMethod/other', (req,res) => {
  res.send({ method: req.method, rule: req._sampleRule })
})




/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Sampling Tests:', function() {

  describe('Configurations:', function() {
    it('Invalid sampling config', async function() {
      let error_message
      try {
        const api_error = require('../index')({ version: 'v1.0', logger: {
          sampling: 'invalid'
        } })
      } catch(e) {
        error_message = e.message
      }
      expect(error_message).toBe('Invalid sampler configuration')
    }) // end it


    it('Missing route in rules', async function() {
      let error_message
      try {
        const api_error = require('../index')({ version: 'v1.0', logger: {
          sampling: {
            rules: [
              { route: '/testNone',  target: 0, rate: 0, period: 5 },
              { target: 0, rate: 0, period: 5 }
            ]
          }
        } })
      } catch(e) {
        error_message = e.message
      }
      expect(error_message).toBe('Invalid route specified in rule')
    }) // end it


    it('Invalid route in rules', async function() {
      let error_message
      try {
        const api_error = require('../index')({ version: 'v1.0', logger: {
          sampling: {
            rules: [
              { route: '/testNone',  target: 0, rate: 0, period: 5 },
              { route: 1, target: 0, rate: 0, period: 5 }
            ]
          }
        } })
      } catch(e) {
        error_message = e.message
      }
      expect(error_message).toBe('Invalid route specified in rule')
    }) // end it

  })

  describe('Rule Matching', function() {

    it('Match based on method (GET)', async function() {
      let _event = Object.assign({},event,{ path: '/testTargetMethod', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(1)
      expect(data.rule.rate).toBe(0.2)
      expect(data.rule.period).toBe(1)
      expect(data.rule.level).toBe('trace')
    })

    it('Match based on method (POST)', async function() {
      let _event = Object.assign({},event,{ httpMethod: 'post', path: '/testTargetMethod', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('POST')
      expect(data.rule.target).toBe(2)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(2)
      expect(data.rule.level).toBe('info')
    })

    it('Match parameterized path', async function() {
      let _event = Object.assign({},event,{ path: '/testParam/foo', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(10)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(60)
      expect(data.rule.level).toBe('debug')
    })

    it('Match deep parameterized path', async function() {
      let _event = Object.assign({},event,{ path: '/testParam/foo/deep', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(20)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(60)
      expect(data.rule.level).toBe('info')
    })

    it('Match wildcard route', async function() {
      let _event = Object.assign({},event,{ path: '/testWildCard/other', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(30)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(60)
      expect(data.rule.level).toBe('debug')
    })

    it('Match static route (w/ wildcard at the same level)', async function() {
      let _event = Object.assign({},event,{ path: '/testWildCard/test', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(40)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(60)
      expect(data.rule.level).toBe('debug')
    })

    it('Match deep wildcard route', async function() {
      let _event = Object.assign({},event,{ path: '/testWildCard/other/deep', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(30)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(60)
      expect(data.rule.level).toBe('debug')
    })

    it('Match wildcard route (by method)', async function() {
      let _event = Object.assign({},event,{ path: '/testWildCardMethod/other', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(50)
      expect(data.rule.rate).toBe(0.1)
      expect(data.rule.period).toBe(60)
      expect(data.rule.level).toBe('debug')
    })

    it('Matches first rule in rules array', async () => {
      let _event = Object.assign({},event,{ path: '/testNone', queryStringParameters: { test: true } })
      let result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
      let data = JSON.parse(result.body)

      expect(data.method).toBe('GET')
      expect(data.rule.target).toBe(0)
      expect(data.rule.rate).toBe(0)
      expect(data.rule.period).toBe(1)
      expect(data.rule.level).toBe('trace')
    })
  })


  describe('Simulations', function() {

    // Create a temporary logger to capture the console.log
    let consoleLog = console.log
    let _log = []
    // const logger = log => { try { _log.push(JSON.parse(log)) } catch(e) { _log.push(log) } }
    const logger = (...logs) => {
      let log
      try { log = JSON.parse(logs[0]) } catch(e) { }
      if (log && log.level) { _log.push(log) } else { console.info(...logs) }
    }

    it('Default route', async function() {
      // this.timeout(10000);
      // this.slow(10000);
      _log = [] // clear log
      request = 1 // reset requests
      api_rules._initTime = Date.now() // reset _initTime for the API

      // Set the number of simulated requests
      let requests = 100

      // Set the default event, init result, override logger, and start the counter
      let _event = Object.assign({},event,{ path: '/' })
      let result
      console.log = logger
      let start = Date.now()

      for(let x = 0; x<requests;x++) {
        result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
        await delay(20)
      } // end for loop

      // End the timer and restore console.log
      let end = Date.now()
      console.log = consoleLog

      let data = JSON.parse(result.body)
      let rules = data.rule

      let totalTime = end - start
      let totalFixed = Math.ceil(totalTime/(rules.period*1000)*rules.target)
      let totalRate = Math.ceil(requests*rules.rate)
      let deviation = Math.abs(((totalFixed+totalRate)/_log.length-1).toFixed(2))

      expect(deviation).toBeLessThan(0.12)
    }) // end it



    it.skip('Fixed target only route', async function() {
      // this.timeout(10000);
      // this.slow(10000);
      _log = [] // clear log
      request = 1 // reset requests
      api_rules._initTime = Date.now() // reset _initTime for the API

      // Set the number of simulated requests
      let requests = 100

      // Set the default event, init result, override logger, and start the counter
      let _event = Object.assign({},event,{ path: '/testTarget' })
      let result
      console.log = logger
      let start = Date.now()

      for(let x = 0; x<requests;x++) {
        result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
        await delay(20)
      } // end for loop

      // End the timer and restore console.log
      let end = Date.now()
      console.log = consoleLog

      let data = JSON.parse(result.body)
      let rules = data.rule

      let totalTime = end - start
      let totalFixed = Math.ceil(totalTime/(rules.period*1000)*rules.target)
      let totalRate = Math.ceil(requests*rules.rate)
      let deviation = Math.abs(((totalFixed+totalRate)/_log.length-1).toFixed(2))

      // console.log(_log.length,totalFixed,totalRate,deviation)
      expect(deviation).toBeLessThan(0.15)
    }) // end it



    it('Fixed rate only route', async function() {
      // this.timeout(10000);
      // this.slow(10000);
      _log = [] // clear log
      request = 1 // reset requests
      api_rules._initTime = Date.now() // reset _initTime for the API

      // Set the number of simulated requests
      let requests = 100

      // Set the default event, init result, override logger, and start the counter
      let _event = Object.assign({},event,{ path: '/testTargetRate' })
      let result
      console.log = logger
      let start = Date.now()

      for(let x = 0; x<requests;x++) {
        result = await new Promise(r => api_rules.run(_event,context,(e,res) => { r(res) }))
        await delay(20)
        // await Promise.delay(20)
      } // end for loop

      // End the timer and restore console.log
      let end = Date.now()
      console.log = consoleLog

      let data = JSON.parse(result.body)
      let rules = data.rule

      let totalTime = end - start
      let totalFixed = Math.ceil(totalTime/(rules.period*1000)*rules.target)
      let totalRate = Math.ceil(requests*rules.rate)
      let deviation = Math.abs(((totalFixed+totalRate)/_log.length-1).toFixed(2))

      // console.log(_log);
      // console.log(totalTime,_log.length,totalFixed,totalRate,deviation)
      expect(deviation).toBeLessThan(0.12)
    }) // end it



  }) // end simulations

})
