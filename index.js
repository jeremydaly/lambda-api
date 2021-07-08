'use strict';

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @version 0.11.0
 * @license MIT
 */

const REQUEST = require('./lib/request'); // Resquest object
const RESPONSE = require('./lib/response'); // Response object
const UTILS = require('./lib/utils'); // Require utils library
const LOGGER = require('./lib/logger'); // Require logger library
const prettyPrint = require('./lib/prettyPrint'); // Pretty print for debugging
const { ConfigurationError } = require('./lib/errors'); // Require custom errors

// Create the API class
class API {
  // Create the constructor function.
  constructor(props) {
    // Set the version and base paths
    this._version = props && props.version ? props.version : 'v1';
    this._base =
      props && props.base && typeof props.base === 'string'
        ? props.base.trim()
        : '';
    this._callbackName =
      props && props.callback ? props.callback.trim() : 'callback';
    this._mimeTypes =
      props && props.mimeTypes && typeof props.mimeTypes === 'object'
        ? props.mimeTypes
        : {};
    this._serializer =
      props && props.serializer && typeof props.serializer === 'function'
        ? props.serializer
        : JSON.stringify;
    this._errorHeaderWhitelist =
      props && Array.isArray(props.errorHeaderWhitelist)
        ? props.errorHeaderWhitelist.map((header) => header.toLowerCase())
        : [];
    this._isBase64 =
      props && typeof props.isBase64 === 'boolean' ? props.isBase64 : false;
    this._headers =
      props && props.headers && typeof props.headers === 'object'
        ? props.headers
        : {};
    this._compression =
      props &&
      (typeof props.compression === 'boolean' ||
        Array.isArray(props.compression))
        ? props.compression
        : false;

    // Set sampling info
    this._sampleCounts = {};

    // Init request counter
    this._requestCount = 0;

    // Track init date/time
    this._initTime = Date.now();

    // Logging levels
    this._logLevels = {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    };

    // Configure logger
    this._logger = LOGGER.config(props && props.logger, this._logLevels);

    // Prefix stack w/ base
    this._prefix = this.parseRoute(this._base);

    // Stores route mappings
    this._routes = {};

    // Init callback
    this._cb;

    // Error middleware stack
    this._errors = [];

    // Store app packages and namespaces
    this._app = {};

    // Executed after the callback
    this._finally = () => {};

    // Global error status (used for response parsing errors)
    this._errorStatus = 500;

    // Methods
    this._methods = [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
      'any',
    ];

    // Convenience methods for METHOD
    this._methods.forEach((m) => {
      this[m] = (...a) => this.METHOD(m.toUpperCase(), ...a);
    });
  } // end constructor

  // METHOD: Adds method, middleware, and handlers to routes
  METHOD(method, ...args) {
    // Extract path if provided, otherwise default to global wildcard
    let path = typeof args[0] === 'string' ? args.shift() : '/*';

    // Extract the execution stack
    let stack = args.map((fn, i) => {
      if (
        typeof fn === 'function' &&
        (fn.length === 3 || i === args.length - 1)
      )
        return fn;
      throw new ConfigurationError(
        'Route-based middleware must have 3 parameters'
      );
    });

    if (stack.length === 0)
      throw new ConfigurationError(
        `No handler or middleware specified for ${method} method on ${path} route.`
      );

    // Ensure methods is an array and upper case
    let methods = (Array.isArray(method) ? method : method.split(',')).map(
      (x) => (typeof x === 'string' ? x.trim().toUpperCase() : null)
    );

    // Parse the path
    let parsedPath = this.parseRoute(path);

    // Split the route and clean it up
    let route = this._prefix.concat(parsedPath);

    // For root path support
    if (route.length === 0) {
      route.push('');
    }

    // Keep track of path variables
    let pathVars = {};

    // Make a local copy of routes
    let routes = this._routes;

    // Create a local stack for inheritance
    let _stack = { '*': [], m: [] };

    // Loop through the path levels
    for (let i = 0; i < route.length; i++) {
      // Flag as end of the path
      let end = i === route.length - 1;

      // If this is a parameter variable
      if (/^:(.*)$/.test(route[i])) {
        // Assign it to the pathVars (trim off the : at the beginning)
        pathVars[i] = [route[i].substr(1)];
        // Set the route to __VAR__
        route[i] = '__VAR__';
      } // end if variable

      // Create routes and add path if they don't exist
      if (!routes['ROUTES']) {
        routes['ROUTES'] = {};
      }
      if (!routes['ROUTES'][route[i]]) {
        routes['ROUTES'][route[i]] = {};
      }

      // Loop through methods for the route
      methods.forEach((_method) => {
        // Method must be a string
        if (typeof _method === 'string') {
          // Check for wild card at this level
          if (routes['ROUTES']['*']) {
            if (
              routes['ROUTES']['*']['MIDDLEWARE'] &&
              (route[i] !== '*' || _method !== '__MW__')
            ) {
              _stack['*'][method] = routes['ROUTES']['*']['MIDDLEWARE'].stack;
            }
            if (
              routes['ROUTES']['*']['METHODS'] &&
              routes['ROUTES']['*']['METHODS'][method]
            ) {
              _stack['m'][method] =
                routes['ROUTES']['*']['METHODS'][method].stack;
            }
          } // end if wild card

          // If this is the end of the path
          if (end) {
            // Check for matching middleware
            if (
              route[i] !== '*' &&
              routes['ROUTES'][route[i]] &&
              routes['ROUTES'][route[i]]['MIDDLEWARE']
            ) {
              _stack['m'][method] =
                routes['ROUTES'][route[i]]['MIDDLEWARE'].stack;
            } // end if

            // Generate the route/method meta data
            let meta = {
              vars: pathVars,
              stack: _stack['m'][method]
                ? _stack['m'][method].concat(stack)
                : _stack['*'][method]
                ? _stack['*'][method].concat(stack)
                : stack,
              // inherited: _stack[method] ? _stack[method] : [],
              route: '/' + parsedPath.join('/'),
              path: '/' + this._prefix.concat(parsedPath).join('/'),
            };

            // If mounting middleware
            if (method === '__MW__') {
              // Merge stacks if middleware exists
              if (routes['ROUTES'][route[i]]['MIDDLEWARE']) {
                meta.stack =
                  routes['ROUTES'][route[i]]['MIDDLEWARE'].stack.concat(stack);
                meta.vars = UTILS.mergeObjects(
                  routes['ROUTES'][route[i]]['MIDDLEWARE'].vars,
                  pathVars
                );
              }
              // Add/update middleware
              routes['ROUTES'][route[i]]['MIDDLEWARE'] = meta;

              // Apply middleware to all child middlware routes
              // if (route[i] === "*") {
              //   // console.log("APPLY NESTED MIDDLEWARE");
              //   // console.log(JSON.stringify(routes["ROUTES"], null, 2));
              //   Object.keys(routes["ROUTES"]).forEach((nestedRoute) => {
              //     if (nestedRoute != "*") {
              //       console.log(nestedRoute);
              //     }
              //   });
              // }
            } else {
              // Create the methods section if it doesn't exist
              if (!routes['ROUTES'][route[i]]['METHODS'])
                routes['ROUTES'][route[i]]['METHODS'] = {};

              // Merge stacks if method already exists for this route
              if (routes['ROUTES'][route[i]]['METHODS'][_method]) {
                meta.stack =
                  routes['ROUTES'][route[i]]['METHODS'][_method].stack.concat(
                    stack
                  );
                meta.vars = UTILS.mergeObjects(
                  routes['ROUTES'][route[i]]['METHODS'][_method].vars,
                  pathVars
                );
              }

              // Add method and meta data
              routes['ROUTES'][route[i]]['METHODS'][_method] = meta;
            } // end else

            // console.log('STACK:',meta);

            // If there's a wild card that's not at the end
          } else if (route[i] === '*') {
            throw new ConfigurationError(
              'Wildcards can only be at the end of a route definition'
            );
          } // end if end of path
        } // end if method is string
      }); // end methods loop

      // Update the current routes pointer
      routes = routes['ROUTES'][route[i]];
    } // end path traversal loop

    // console.log(JSON.stringify(this._routes,null,2));
  } // end main METHOD function

  // RUN: This runs the routes
  async run(event, context, cb) {
    // Set the event, context and callback
    this._event = event || {};
    this._context = this.context = typeof context === 'object' ? context : {};
    this._cb = cb ? cb : undefined;

    // Initalize request and response objects
    let request = new REQUEST(this);
    let response = new RESPONSE(this, request);

    try {
      // Parse the request
      await request.parseRequest();

      // Loop through the execution stack
      for (const fn of request._stack) {
        // Only run if in processing state
        if (response._state !== 'processing') break;

        // eslint-disable-next-line
        await new Promise(async (r) => {
          try {
            let rtn = await fn(request, response, () => {
              r();
            });
            if (rtn) response.send(rtn);
            if (response._state === 'done') r(); // if state is done, resolve promise
          } catch (e) {
            await this.catchErrors(e, response);
            r(); // resolve the promise
          }
        });
      } // end for
    } catch (e) {
      // console.log(e);
      await this.catchErrors(e, response);
    }

    // Return the final response
    return response._response;
  } // end run function

  // Catch all async/sync errors
  async catchErrors(e, response, code, detail) {
    // Error messages should respect the app's base64 configuration
    response._isBase64 = this._isBase64;

    // Strip the headers, keep whitelist
    const strippedHeaders = Object.entries(response._headers).reduce(
      (acc, [headerName, value]) => {
        if (!this._errorHeaderWhitelist.includes(headerName.toLowerCase())) {
          return acc;
        }

        return Object.assign(acc, { [headerName]: value });
      },
      {}
    );

    response._headers = Object.assign(strippedHeaders, this._headers);

    let message;

    // Set the status code
    response.status(code ? code : this._errorStatus);

    let info = {
      detail,
      statusCode: response._statusCode,
      coldStart: response._request.coldStart,
      stack: (this._logger.stack && e.stack) || undefined,
    };

    if (e instanceof Error) {
      message = e.message;
      if (this._logger.errorLogging) {
        this.log.fatal(message, info);
      }
    } else {
      message = e;
      if (this._logger.errorLogging) {
        this.log.error(message, info);
      }
    }

    // If first time through, process error middleware
    if (response._state === 'processing') {
      // Flag error state (this will avoid infinite error loops)
      response._state = 'error';

      // Execute error middleware
      for (const err of this._errors) {
        if (response._state === 'done') break;
        // Promisify error middleware
        await new Promise((r) => {
          let rtn = err(e, response._request, response, () => {
            r();
          });
          if (rtn) response.send(rtn);
        });
      } // end for
    }

    // Throw standard error unless callback has already been executed
    if (response._state !== 'done') response.json({ error: message });
  } // end catch

  // Custom callback
  async _callback(err, res, response) {
    // Set done status
    response._state = 'done';

    // Execute finally
    await this._finally(response._request, response);

    // Output logs
    response._request._logs.forEach((log) => {
      this._logger.logger(
        JSON.stringify(
          this._logger.detail
            ? this._logger.format(log, response._request, response)
            : log
        )
      );
    });

    // Generate access log
    if (
      (this._logger.access || response._request._logs.length > 0) &&
      this._logger.access !== 'never'
    ) {
      let access = Object.assign(
        this._logger.log(
          'access',
          undefined,
          response._request,
          response._request.context
        ),
        {
          statusCode: res.statusCode,
          coldStart: response._request.coldStart,
          count: response._request.requestCount,
        }
      );
      this._logger.logger(
        JSON.stringify(this._logger.format(access, response._request, response))
      );
    }

    // Reset global error code
    this._errorStatus = 500;

    // Execute the primary callback
    typeof this._cb === 'function' && this._cb(err, res);
  } // end _callback

  // Middleware handler
  use(...args) {
    // Extract routes
    let routes =
      typeof args[0] === 'string'
        ? Array.of(args.shift())
        : Array.isArray(args[0])
        ? args.shift()
        : ['/*'];

    // Init middleware stack
    let middleware = [];

    // Add func args as middleware
    for (let arg in args) {
      if (typeof args[arg] === 'function') {
        if (args[arg].length === 3) {
          middleware.push(args[arg]);
        } else if (args[arg].length === 4) {
          this._errors.push(args[arg]);
        } else {
          throw new ConfigurationError(
            'Middleware must have 3 or 4 parameters'
          );
        }
      }
    }

    // Add middleware for all methods
    if (middleware.length > 0) {
      routes.forEach((route) => {
        this.METHOD('__MW__', route, ...middleware);
      });
    }
  } // end use

  // Finally handler
  finally(fn) {
    this._finally = fn;
  }

  //-------------------------------------------------------------------------//
  // UTILITY FUNCTIONS
  //-------------------------------------------------------------------------//

  parseRoute(path) {
    return path
      .trim()
      .replace(/^\/(.*?)(\/)*$/, '$1')
      .split('/')
      .filter((x) => x.trim() !== '');
  }

  // Load app packages
  app(packages) {
    // Check for supplied packages
    if (typeof packages === 'object') {
      // Loop through and set package namespaces
      for (let namespace in packages) {
        try {
          this._app[namespace] = packages[namespace];
        } catch (e) {
          console.error(e.message); // eslint-disable-line no-console
        }
      }
    } else if (arguments.length === 2 && typeof packages === 'string') {
      this._app[packages] = arguments[1];
    } // end if

    // Return a reference
    return this._app;
  }

  // Register routes with options
  register(fn, opts) {
    let options = typeof opts === 'object' ? opts : {};

    // Extract Prefix
    let prefix =
      options.prefix && options.prefix.toString().trim() !== ''
        ? this.parseRoute(options.prefix)
        : [];

    // Concat to existing prefix
    this._prefix = this._prefix.concat(prefix);

    // Execute the routing function
    fn(this, options);

    // Remove the last prefix (if a prefix exists)
    if (prefix.length > 0) {
      this._prefix = this._prefix.slice(0, -prefix.length);
    }
  } // end register

  // prettyPrint debugger
  routes(format) {
    // Parse the routes
    let routes = UTILS.extractRoutes(this._routes);

    if (format) {
      console.log(prettyPrint(routes)); // eslint-disable-line no-console
    } else {
      return routes;
    }
  }
} // end API class

// Export the API class as a new instance
module.exports = (opts) => new API(opts);
// Add createAPI as default export (to match index.d.ts)
module.exports.default = module.exports;
