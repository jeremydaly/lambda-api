'use strict';

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @version 0.6.0
 * @license MIT
 */

const REQUEST = require('./lib/request.js') // Resquest object
const RESPONSE = require('./lib/response.js') // Response object

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

    // Stores timers for debugging
    this._timers = {}
    this._procTimes = {}

    // Stores route mappings
    this._routes = {}

    // Default callback
    this._cb = function(err,res) { console.log('No callback specified') }

    // Middleware stack
    this._middleware = []

    // Error middleware stack
    this._errors = []

    // Store app packages and namespaces
    this._app = {}

    // Keep track of callback execution
    this._done = false

    // Keep track of triggered errors
    this._error = false

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


  // METHOD: Adds method and handler to routes
  METHOD(method, path, handler) {

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

      // Add the route to the global _routes
      this.setRoute(
        this._routes,
        (i === route.length-1 ? { ['__'+method.toUpperCase()]: { vars: pathVars, handler: handler, route: '/'+parsedPath.join('/') } } : {}),
        route.slice(0,i+1)
      )

    } // end for loop

  } // end main METHOD function



  // RUN: This runs the routes
  async run(event,context,cb) {

    // Set the event, context and callback
    this._event = event
    this._context = context
    this._cb = cb
    this._done = false
    this._error = false

    try {
      // Initalize response and request objects
      this.response = new RESPONSE(this)
      this.request = new REQUEST(this)

      // Loop through the middleware and await response
      for (const mw of this._middleware) {
        if (this._done || this._error) break
        // Promisify middleware
        await new Promise(r => { mw(this.request,this.response,() => { r() }) })
      } // end for

      // Execute the primary handler
      if (!this._done && !this._error) await this.handler(this.request,this.response)

    } catch(e) {
      this.catchErrors(e)
    }

  } // end run function



  // Catch all async/sync errors
  async catchErrors(e) {

    // Error messages should never be base64 encoded
    this.response._isBase64 = false

    // Strip the headers (TODO: find a better way to handle this)
    this.response._headers = {}

    let message;

    if (e instanceof Error) {
      this.response.status(this._errorStatus)
      message = e.message
      !this._test && console.log(e)
    } else {
      message = e
      !this._test && console.log('API Error:',e)
    }

    // If first time through, process error middleware
    if (!this._error) {

      // Flag error state (this will avoid infinite error loops)
      this._error = true

      // Execute error middleware
      for (const err of this._errors) {
        if (this._done) break
        // Promisify error middleware
        await new Promise(r => { err(e,this.request,this.response,() => { r() }) })
      } // end for
    }

    // Throw standard error unless callback has already been executed
    if (!this._done) this.response.json({'error':message})

  } // end catch



  // Custom callback
  async _callback(err, res) {

    // Set done status
    this._done = true

    // Execute finally
    await this._finally(this.request,this.response)

    // Execute the primary callback
    this._cb(err,res)

  } // end _callback



  // Middleware handler
  use(fn) {
    if (fn.length === 3) {
      this._middleware.push(fn)
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
    if (typeof path === "string") {
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
          console.error(e.message)
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


} // end API class


// Export the API class as a new instance
module.exports = opts => new API(opts)
