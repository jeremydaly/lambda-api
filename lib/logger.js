'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */


// Config logger
exports.config = (config,levels) => {

  let cfg = config ? config : {}

  // Add custom logging levels
  if (cfg.levels && typeof cfg.levels === 'object') {
    for (let lvl in cfg.levels) {
      if (!/^[A-Za-z_]\w*$/.test(lvl) || isNaN(cfg.levels[lvl])) {
        throw new Error('Invalid level configuration')
      }
    }
    levels = Object.assign(levels,cfg.levels)
  }

  // Configure sampling rules
  let sampling = cfg.sampling ? parseSamplerConfig(cfg.sampling,levels) : false

  // Parse/default the logging level
  let level = cfg === true ? 'info' :
    cfg.level && levels[cfg.level.toLowerCase()] ?
      cfg.level.toLowerCase() : cfg.level === 'none' ?
        'none' : Object.keys(cfg).length > 0 ? 'info' : 'none'

  let messageKey = cfg.messageKey && typeof cfg.messageKey === 'string' ?
    cfg.messageKey.trim() : 'msg'

  let customKey = cfg.customKey && typeof cfg.customKey === 'string' ?
    cfg.customKey.trim() : 'custom'

  let timestamp = cfg.timestamp === false ? () => undefined :
    typeof cfg.timestamp === 'function' ? cfg.timestamp : () => Date.now()

  let timer = cfg.timer === false ? () => undefined : (start) => (Date.now()-start)

  let nested = cfg.nested === true ? true : false // nest serializers
  let stack = cfg.stack === true ? true : false // show stack traces in errors
  let access = cfg.access === true ? true : cfg.access === 'never' ? 'never' : false // create access logs
  let detail = cfg.detail === true ? true : false // add req/res detail to all logs

  let defaults = {
    req: req => {
      return {
        path: req.path,
        ip: req.ip,
        ua: req.userAgent,
        method: req.method,
        version: req.version,
        qs: Object.keys(req.query).length > 0 ? req.query : undefined
      }
    },
    res: () => {
      return { }
    },
    context: context => {
      return {
        remaining: context.getRemainingTimeInMillis && context.getRemainingTimeInMillis(),
        function: context.functionName && context.functionName,
        memory: context.memoryLimitInMB && context.memoryLimitInMB
      }
    },
    custom: custom => typeof custom === 'object' || nested ? custom : { [customKey]: custom }
  }

  let serializers = {
    main: cfg.serializers && typeof cfg.serializers.main === 'function' ? cfg.serializers.main : () => {},
    req: cfg.serializers && typeof cfg.serializers.req === 'function' ? cfg.serializers.req : () => {},
    res: cfg.serializers && typeof cfg.serializers.res === 'function' ? cfg.serializers.res : () => {},
    context: cfg.serializers && typeof cfg.serializers.context === 'function' ? cfg.serializers.context : () => {},
    custom: cfg.serializers && typeof cfg.serializers.context === 'function' ? cfg.serializers.context : () => {}
  }

  // Main logging function
  let log = (level,msg,req,context,custom) => {

    let _context = Object.assign(defaults.context(context),serializers.custom(context))
    let _custom = Object.assign(defaults.custom(custom),serializers.custom(custom))

    return Object.assign({},
      {
        level,
        time: timestamp(),
        id: req.id,
        path: req.path,
        [messageKey]: msg,
        timer: timer(req._start),
        sample: req._sample ? true : undefined
      },
      serializers.main(req),
      nested ? { [customKey]: _custom } : _custom,
      nested ? { context: _context } : _context
    )
  }

  // Formatting function for additional log data enrichment
  let format = function(info,req,res) {

    let _req = Object.assign(defaults.req(req),serializers.req(req))
    let _res = Object.assign(defaults.res(res),serializers.res(res))

    return Object.assign({},
      info,
      nested ? { req: _req } : _req,
      nested ? { res: _res } : _res
    )
  } // end format

  // Return logger object
  return {
    level,
    stack,
    log,
    format,
    access,
    detail,
    sampling
  }
}

// Determine if we should sample this request
exports.sampler = (app,req) => {

  if (app._logger.sampling) {

    // default level to false
    let level = false

    // Grab the rule based on route
    let rule = app._logger.sampling.rules && app._logger.sampling.rules[req.route]
      || app._logger.sampling.defaults

    // Get last sample time (default start, last, fixed count, period count and total count)
    let counts = app._sampleCounts[rule.default ? 'default' : req.route]
      || Object.assign(app._sampleCounts, {
        [rule.default ? 'default' : req.route]: { start: 0, fCount: 0, pCount: 0, tCount: 0 }
      })[rule.default ? 'default' : req.route]

    let now = Date.now()

    // If this is a new period, reset values
    if ((now-counts.start) > rule.period*1000) {
      counts.start = now
      counts.pCount = 0

      // If a rule target is set, sample the start
      if (rule.target > 0) {
        counts.fCount = 1
        level = rule.level // set the sample level
        console.log('\n*********** NEW PERIOD ***********');
      }
    // Enable sampling if last sample is passed target split
    } else if (rule.target > 0 &&
      counts.start+Math.floor(rule.period*1000/rule.target*counts.fCount) < now) {
        level = rule.level
        counts.fCount++
        console.log('\n*********** FIXED ***********');
    } else if (rule.rate > 0 &&
      counts.start+Math.floor(rule.period*1000/(counts.tCount/(now-app._initTime)*rule.period*1000*rule.rate)*counts.pCount) < now) {
        level = rule.level
        counts.pCount++
        console.log('\n*********** RATE ***********');
    }


    // Increment total count
    counts.tCount++


    // console.log(
    //   '-----------------------------------',
    //   '\nlastSample:',app._lastSample,
    //   '\nsampleCounts:',app._sampleCounts,
    //   '\nrequestCount:',app._requestCount,
    //   '\ninitTime:',app._initTime,
    //   '\nlogger:',JSON.stringify(app._logger,null,2),
    //   '\nroute:', req.route,
    //   '\nmethod:', req.method,
    //   '\n-----------------------------------'
    // )


    return level

  } // end if sampling

  return false
}

// Parse sampler configuration
const parseSamplerConfig = (config,levels) => {

  // Default config
  let cfg = typeof config === 'object' ? config : config === true ? {} : false

  // Error on invalid config
  if (cfg === false) throw new Error('Invalid sampler configuration')

  // Create rule default
  let defaults = (inputs) => {
    return { // target, rate, period, method, level
      target: Number.isInteger(inputs.target) ? inputs.target : 1,
      rate: !isNaN(inputs.rate) && inputs.rate <= 1 ? inputs.rate : 0.1,
      period: Number.isInteger(inputs.period) ? inputs.period : 60, // in seconds
      method: (Array.isArray(inputs.method) ? inputs.method :
        typeof inputs.method === 'string' ?
          inputs.method.split(',') : ['*']).map(x => x.toString().trim()),
      level: Object.keys(levels).includes(inputs.level) ? inputs.level : 'trace'
    }
  }

  // Parse and default rules
  let rules = Array.isArray(cfg.rules) ? cfg.rules.reduce((acc,rule) => {
    // Error if missing route or not a string
    if (!rule.route || typeof rule.route !== 'string')
      throw new Error('Invalid route specified in rule')

    return Object.assign(acc, { [rule.route.trim()]: defaults(rule) })
  },{}) : {}

  return {
    defaults: Object.assign(defaults(cfg),{ default:true }),
    rules
  }

} // end parseSamplerConfig
