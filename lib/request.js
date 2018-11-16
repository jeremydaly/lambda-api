'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

const QS = require('querystring') // Require the querystring library
const UTILS = require('./utils') // Require utils library
const LOGGER = require('./logger') // Require logger library
const { RouteError, MethodError } = require('./errors') // Require custom errors

class REQUEST {

  // Create the constructor function.
  constructor(app) {

    // Record start time
    this._start = Date.now()

    // Create a reference to the app
    this.app = app

    // Flag cold starts
    this.coldStart = app._requestCount === 0 ? true : false

    // Increment the requests counter
    this.requestCount = ++app._requestCount

    // Init the handler
    this._handler

    // Expose Namespaces
    this.namespace = this.ns = app._app

    // Set the version
    this.version = app._version

    // Init the params
    this.params = {}

    this.headers = {}

    // Init log helpers (message,custom) and create app reference
    app.log = this.log = Object.keys(app._logLevels).reduce((acc,lvl) =>
      Object.assign(acc,{ [lvl]: (m,c) => this.logger(lvl, m, this, this.context, c) }),{})

    // Init _logs array for storage
    this._logs = []

  } // end constructor

  // Parse the request
  async parseRequest() {

    // Set the method
    this.method = this.app._event.httpMethod ? this.app._event.httpMethod.toUpperCase() : 'GET'

    // Set the path
    this.path = this.app._event.path

    // Set the query parameters
    this.query = this.app._event.queryStringParameters ? this.app._event.queryStringParameters : {}

    // Set the raw headers
    this.rawHeaders = this.app._event.headers || {}

    // Set the headers to lowercase
    this.headers = Object.keys(this.rawHeaders).reduce((acc,header) =>
      Object.assign(acc,{[header.toLowerCase()]:this.rawHeaders[header]}), {})

    // Extract IP
    this.ip = this.headers['x-forwarded-for'] && this.headers['x-forwarded-for'].split(',')[0].trim()

    // Extract user agent
    this.userAgent = this.headers['user-agent']

    // Set and parse cookies
    this.cookies = this.headers.cookie ?
      this.headers.cookie.split(';')
        .reduce(
          (acc,cookie) => {
            cookie = cookie.trim().split('=')
            return Object.assign(acc,{ [cookie[0]] : UTILS.parseBody(decodeURIComponent(cookie[1])) })
          },
          {}
        ) : {}

    // Attempt to parse the auth
    this.auth = UTILS.parseAuth(this.headers.authorization)

    // Set the requestContext
    this.requestContext = this.app._event.requestContext || {}

    // Set the pathParameters
    this.pathParameters = this.app._event.pathParameters || {}

    // Set the stageVariables
    this.stageVariables = this.app._event.stageVariables || {}

    // Set the isBase64Encoded
    this.isBase64Encoded = this.app._event.isBase64Encoded || {}

    // Add context
    this.context = this.app.context && typeof this.app.context === 'object' ? this.app.context : {}

    // Parse id from context
    this.id = this.context.awsRequestId ? this.context.awsRequestId : null

    // Determine client type
    this.clientType =
      this.headers['cloudfront-is-desktop-viewer'] === 'true' ? 'desktop' :
        this.headers['cloudfront-is-mobile-viewer'] === 'true' ? 'mobile' :
          this.headers['cloudfront-is-smarttv-viewer'] === 'true' ? 'tv' :
            this.headers['cloudfront-is-tablet-viewer'] === 'true' ? 'tablet' :
              'unknown'

    // Parse country
    this.clientCountry = this.headers['cloudfront-viewer-country'] ?
      this.headers['cloudfront-viewer-country'].toUpperCase() : 'unknown'

    // Capture the raw body
    this.rawBody = this.app._event.body

    // Set the body (decode it if base64 encoded)
    this.body = this.app._event.isBase64Encoded ? Buffer.from(this.app._event.body, 'base64').toString() : this.app._event.body

    // Set the body
    if (this.headers['content-type'] && this.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      this.body = QS.parse(this.body)
    } else if (typeof this.body === 'object') {
      this.body = this.body
    } else {
      this.body = UTILS.parseBody(this.body)
    }

    // Extract path from event (strip querystring just in case)
    let path = UTILS.parsePath(this.path)

    // Init the route
    this.route = null

    // Create a local routes reference
    let routes = this.app._routes

    // Init wildcard
    let wildcard = {}

    // Loop the routes and see if this matches
    for (let i=0; i<path.length; i++) {

      // Capture wildcard routes
      if (routes['*']) { wildcard = routes['*'] }

      // Traverse routes
      if (routes[path[i]]) {
        routes = routes[path[i]]
      } else if (routes['__VAR__']) {
        routes = routes['__VAR__']
      } else {
        this.app._errorStatus = 404
        throw new RouteError('Route not found','/'+path.join('/'))
      }
    } // end for loop

    // Select ROUTE if exist for method, default ANY, apply wildcards, alias HEAD requests
    let route = routes['__'+this.method] ? routes['__'+this.method] :
      (routes['__ANY'] ? routes['__ANY'] :
        (wildcard && wildcard['__'+this.method] ? wildcard['__'+this.method] :
          (wildcard && wildcard['__ANY'] ? wildcard['__ANY'] :
            (this.method === 'HEAD' && routes['__GET'] ? routes['__GET'] :
              undefined))))

    // Check for the requested method
    if (route) {

      // Assign path parameters
      for (let x in route.vars) {
        this.params[route.vars[x]] = path[x]
      } // end for

      // Set the route used
      this.route = route.route

      // Set the handler
      this._handler = route.handler

    } else {
      this.app._errorStatus = 405
      throw new MethodError('Method not allowed',this.method,'/'+path.join('/'))
    }

    // Reference to sample rule
    this._sampleRule = {}

    // Enable sampling
    this._sample = LOGGER.sampler(this.app,this)

  } // end parseRequest

  // Main logger
  logger(...args) {
    this.app._logger.level !== 'none' &&
      this.app._logLevels[args[0]] >=
        this.app._logLevels[this._sample ? this._sample : this.app._logger.level] &&
          this._logs.push(this.app._logger.log(...args))
  }


} // end REQUEST class

// Export the response object
module.exports = REQUEST
