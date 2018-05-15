'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

const QS = require('querystring') // Require the querystring library
const UTILS = require('./utils.js') // Require utils library

class REQUEST {

  // Create the constructor function.
  constructor(app) {

    // Create a reference to the app
    this.app = app

    // Expose Namespaces
    this.namespace = this.ns = app._app

    // Set the version
    this.version = app._version

    // Init the params
    this.params = {}

    // Set the method
    this.method = app._event.httpMethod.toUpperCase()

    // Set the path
    this.path = app._event.path

    // Set the query parameters
    this.query = app._event.queryStringParameters ? app._event.queryStringParameters : {}

    // Set the headers
    this.rawHeaders = app._event.headers

    this.headers = Object.keys(this.rawHeaders).reduce((acc,header) =>
      Object.assign(acc,{[header.toLowerCase()]:this.rawHeaders[header]}), {})

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
    this.requestContext = app._event.requestContext

    // Capture the raw body
    this.rawBody = app._event.body

    // Set the body (decode it if base64 encoded)
    this.body = app._event.isBase64Encoded ? Buffer.from(app._event.body, 'base64').toString() : app._event.body

    // Set the body
    if (this.headers['content-type'] && this.headers['content-type'].includes("application/x-www-form-urlencoded")) {
      this.body = QS.parse(this.body)
    } else if (typeof this.body === 'object') {
      this.body = this.body
    } else {
      this.body = UTILS.parseBody(this.body)
    }

    // Extract path from event (strip querystring just in case)
    let path = app._event.path.trim().split('?')[0].replace(/^\/(.*?)(\/)*$/,'$1').split('/')

    // Init the route
    this.route = null

    // Create a local routes reference
    let routes = app._routes

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
        app._errorStatus = 404
        throw new Error('Route not found')
      }
    } // end for loop

    // Alias HEAD to GET method
    let method = this.method === 'HEAD' ? 'GET' : this.method

    let route = routes['__'+method] ? routes['__'+method] :
                (wildcard && wildcard['__'+method] ?
                  wildcard['__'+method] : undefined)

    // Check for the requested method
    if (route) {

      // Assign path parameters
      for (let x in route.vars) {
        this.params[route.vars[x]] = path[x]
      } // end for

      // Set the route used
      this.route = route.route

      // Set the handler
      app.handler = route.handler

    } else {
      app._errorStatus = 405
      throw new Error('Method not allowed')
    }

  } // end constructor

} // end REQUEST class

// Export the response object
module.exports = REQUEST
