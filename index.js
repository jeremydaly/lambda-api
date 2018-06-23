'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @version 0.8.0
 * @license MIT
 */

const REQUEST = require('./lib/request.js') // Resquest object
const RESPONSE = require('./lib/response.js') // Response object
const UTILS = require('./lib/utils.js') // Require utils library
const prettyPrint = require('./lib/prettyPrint') // Pretty print for debugging

// Create the API class
class API {

  // Create the constructor function.
  constructor(props) {

    // Set the version and base paths
    this._version = props && props.version ? props.version : 'v1'
    this._base = props && props.base && typeof props.base === 'string' ? props.base.trim() : ''
    this._callbackName = props && props.callback ? props.callback.trim() : 'callback'
    this._mimeTypes = props && props.mimeTypes && typeof props.mimeTypes === 'object' ? props.mimeTypes : {}

    // Prefix stack w/ base
    this._prefix = this.parseRoute(this._base)

    // Stores route mappings
    this._routes = {}

    // Default callback
    this._cb = function() {
      console.log('No callback specified') // eslint-disable-line no-console
    }

    // Middleware stack
    this._middleware = []

    // Error middleware stack
    this._errors = []

    // Store app packages and namespaces
    this._app = {}

    // Executed after the callback
    this._finally = () => {}

    // Global error status
    this._errorStatus = 500

    // Testing flag (disables logging)
    this._test = false

  } // end constructor



  // Convenience methods (path, handler)
  get(p,h) { this.METHOD('GET',p,h) }
  post(p,h) { this.METHOD('POST',p,h) }
  put(p,h) { this.METHOD('PUT',p,h) }
  patch(p,h) { this.METHOD('PATCH',p,h) }
  delete(p,h) { this.METHOD('DELETE',p,h) }
  options(p,h) { this.METHOD('OPTIONS',p,h) }
  head(p,h) { this.METHOD('HEAD',p,h) }
  any(p,h) { this.METHOD('ANY',p,h) }


  // METHOD: Adds method and handler to routes
  METHOD(method, path, handler) {

    // Ensure method is an array
    let methods = Array.isArray(method) ? method : method.split(',')

    // Parse the path
    let parsedPath = this.parseRoute(path)

    // Split the route and clean it up
    let route = this._prefix.concat(parsedPath)

    // For root path support
    if (route.length === 0) { route.push('')}

    // Keep track of path variables
    let pathVars = {}

    // Loop through the paths
    for (let i=0; i<route.length; i++) {

      // If this is a variable
      if (/^:(.*)$/.test(route[i])) {
        // Assign it to the pathVars (trim off the : at the beginning)
        pathVars[i] = route[i].substr(1)
        // Set the route to __VAR__
        route[i] = '__VAR__'
      } // end if variable

      methods.forEach(_method => {
        if (typeof _method === 'string') {
          // Add the route to the global _routes
          this.setRoute(
            this._routes,
            (i === route.length-1 ? {
              ['__'+_method.trim().toUpperCase()]: {
                vars: pathVars,
                handler: handler,
                route: '/'+parsedPath.join('/'),
                path: '/'+this._prefix.concat(parsedPath).join('/') }
            } : {}),
            route.slice(0,i+1)
          )
        }
      }) // end methods loop


    } // end for loop

  } // end main METHOD function



  // RUN: This runs the routes
  async run(event,context,cb) {

    // Set the event, context and callback
    this._event = event
    this._context = this.context = context
    this._cb = cb

    // Initalize request and response objects
    let request = new REQUEST(this)
    let response = new RESPONSE(this,request)

    try {

      // Parse the request
      request.parseRequest()

      // Loop through the middleware and await response
      for (const mw of this._middleware) {
        // Only run middleware if in processing state
        if (response._state !== 'processing') break

        // Init for matching routes
        let matched = false

        // Test paths if they are supplied
        for (const path of mw[0]) {
          if (
            path === request.path || // If exact path match
            path === request.route || // If exact route match
            // If a wildcard match
            (path.substr(-1) === '*' && new RegExp('^' + path.slice(0, -1) + '.*$').test(request.route))
          ) {
            matched = true
            break
          }
        }

        if (mw[0].length > 0 && !matched) continue

        // Promisify middleware
        await new Promise(r => {
          let rtn = mw[1](request,response,() => { r() })
          if (rtn) response.send(rtn)
        })
      } // end for

      // Execute the primary handler if in processing state
      if (response._state === 'processing') {
        let rtn = await request._handler(request,response)
        if (rtn) response.send(rtn)
      }

    } catch(e) {
      this.catchErrors(e,response)
    }

  } // end run function



  // Catch all async/sync errors
  async catchErrors(e,response) {

    // Error messages should never be base64 encoded
    response._isBase64 = false

    // Strip the headers (TODO: find a better way to handle this)
    response._headers = {}

    let message

    if (e instanceof Error) {
      response.status(this._errorStatus)
      message = e.message
      !this._test && console.log(e) // eslint-disable-line no-console
    } else {
      message = e
      !this._test && console.log('API Error:',e) // eslint-disable-line no-console
    }

    // If first time through, process error middleware
    if (response._state === 'processing') {

      // Flag error state (this will avoid infinite error loops)
      response._state === 'error'

      // Execute error middleware
      for (const err of this._errors) {
        if (response._state === 'done') break
        // Promisify error middleware
        await new Promise(r => {
          let rtn = err(e,response._request,response,() => { r() })
          if (rtn) response.send(rtn)
        })
      } // end for
    }

    // Throw standard error unless callback has already been executed
    if (response._state !== 'done') response.json({'error':message})

  } // end catch



  // Custom callback
  async _callback(err, res, response) {

    // Set done status
    response._state = 'done'

    // Execute finally
    await this._finally(response._request,response)

    // Execute the primary callback
    this._cb(err,res)

  } // end _callback



  // Middleware handler
  use(path,handler) {

    let fn = typeof path === 'function' ? path : handler
    let routes = typeof path === 'string' ? Array.of(path) : (Array.isArray(path) ? path : [])

    if (fn.length === 3) {
      this._middleware.push([routes,fn])
    } else if (fn.length === 4) {
      this._errors.push(fn)
    } else {
      throw new Error('Middleware must have 3 or 4 parameters')
    }
  } // end use


  // Finally handler
  finally(fn) {
    this._finally = fn
  }



  //-------------------------------------------------------------------------//
  // UTILITY FUNCTIONS
  //-------------------------------------------------------------------------//

  parseRoute(path) {
    return path.trim().replace(/^\/(.*?)(\/)*$/,'$1').split('/').filter(x => x.trim() !== '')
  }

  // Recursive function to create routes object
  setRoute(obj, value, path) {
    if (typeof path === 'string') {
      let path = path.split('.')
    }

    if (path.length > 1){
      let p = path.shift()
      if (obj[p] === null) {
        obj[p] = {}
      }
      this.setRoute(obj[p], value, path)
    } else {
      if (obj[path[0]] === null) {
        obj[path[0]] = value
      } else {
        obj[path[0]] = Object.assign(value,obj[path[0]])
      }
    }
  } // end setRoute


  // Load app packages
  app(packages) {

    // Check for supplied packages
    if (typeof packages === 'object') {
      // Loop through and set package namespaces
      for (let namespace in packages) {
        try {
          this._app[namespace] = packages[namespace]
        } catch(e) {
          console.error(e.message) // eslint-disable-line no-console
        }
      }
    } else if (arguments.length === 2 && typeof packages === 'string') {
      this._app[packages] = arguments[1]
    }// end if

    // Return a reference
    return this._app
  }


  // Register routes with options
  register(fn,options) {

    // Extract Prefix
    let prefix = options.prefix && options.prefix.toString().trim() !== '' ?
      this.parseRoute(options.prefix) : []

    // Concat to existing prefix
    this._prefix = this._prefix.concat(prefix)

    // Execute the routing function
    fn(this,options)

    // Remove the last prefix
    this._prefix = this._prefix.slice(0,-(prefix.length))

  } // end register


  // prettyPrint debugger
  routes(format) {
    // Parse the routes
    let routes = UTILS.extractRoutes(this._routes)

    if (format) {
      console.log(prettyPrint(routes)) // eslint-disable-line no-console
    } else {
      return routes
    }
  }

} // end API class

// Export the API class as a new instance
module.exports = opts => new API(opts)
