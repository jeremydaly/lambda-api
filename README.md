[![Lambda API](https://www.jeremydaly.com/wp-content/uploads/2018/03/lambda-api-logo.svg)](https://serverless-api.com/)

[![Build Status](https://github.com/jeremydaly/lambda-api/actions/workflows/build.yml/badge.svg)](https://github.com/jeremydaly/lambda-api/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/lambda-api.svg)](https://www.npmjs.com/package/lambda-api)
[![npm](https://img.shields.io/npm/l/lambda-api.svg)](https://www.npmjs.com/package/lambda-api)
[![Coverage Status](https://coveralls.io/repos/github/jeremydaly/lambda-api/badge.svg?branch=main)](https://coveralls.io/github/jeremydaly/lambda-api?branch=main)

### Lightweight web framework for your serverless applications

Lambda API is a lightweight web framework for AWS Lambda using AWS API Gateway Lambda Proxy Integration or ALB Lambda Target Support. This closely mirrors (and is based on) other web frameworks like Express.js and Fastify, but is significantly stripped down to maximize performance with Lambda's stateless, single run executions.

## Using AWS SDK v2?

lambda-api@v1 is using AWS SDK v3.
If you are using AWS SDK v2, please use lambda-api@v0.12.0.

## Simple Example

```javascript
// Require the framework and instantiate it
const api = require('lambda-api')();

// Define a route
api.get('/status', async (req, res) => {
  return { status: 'ok' };
});

// Declare your Lambda handler
exports.handler = async (event, context) => {
  // Run the request
  return await api.run(event, context);
};
```

For a full tutorial see [How To: Build a Serverless API with Serverless, AWS Lambda and Lambda API](https://www.jeremydaly.com/build-serverless-api-serverless-aws-lambda-lambda-api/).

## Why Another Web Framework?

Express.js, Fastify, Koa, Restify, and Hapi are just a few of the many amazing web frameworks out there for Node.js. So why build yet another one when there are so many great options already? One word: **DEPENDENCIES**.

These other frameworks are extremely powerful, but that benefit comes with the steep price of requiring several additional Node.js modules. Not only is this a bit of a security issue (see Beware of Third-Party Packages in [Securing Serverless](https://www.jeremydaly.com/securing-serverless-a-newbies-guide/)), but it also adds bloat to your codebase, filling your `node_modules` directory with a ton of extra files. For serverless applications that need to load quickly, all of these extra dependencies slow down execution and use more memory than necessary. Express.js has **30 dependencies**, Fastify has **12**, and Hapi has **17**! These numbers don't even include their dependencies' dependencies.

Lambda API has **ZERO** dependencies. _None_. _Zip_. _Zilch_.

Lambda API was written to be _extremely lightweight_ and built specifically for **SERVERLESS** applications using AWS Lambda and API Gateway. It provides support for API routing, serving up HTML pages, issuing redirects, serving binary files and much more. Worried about observability? Lambda API has a built-in logging engine that can even periodically sample requests for things like tracing and benchmarking. It has a powerful middleware and error handling system, allowing you to implement just about anything you can dream of. Best of all, it was designed to work with Lambda's Proxy Integration, automatically handling all the interaction with API Gateway for you. It parses **REQUESTS** and formats **RESPONSES**, allowing you to focus on your application's core functionality, instead of fiddling with inputs and outputs.

### Single Purpose Functions

You may have heard that a serverless "best practice" is to keep your functions small and limit them to a single purpose. I generally agree since building monolith applications is not what serverless was designed for. However, what exactly is a "single purpose" when it comes to building serverless APIs and web services? Should we create a separate function for our "create user" `POST` endpoint and then another one for our "update user" `PUT` endpoint? Should we create yet another function for our "delete user" `DELETE` endpoint? You certainly could, but that seems like a lot of repeated boilerplate code. On the other hand, you could create just one function that handled all your user management features. It may even make sense (in certain circumstances) to create one big serverless function handling several related components that can share your VPC database connections.

Whatever you decide is best for your use case, **Lambda API** is there to support you. Whether your function has over a hundred routes, or just one, Lambda API's small size and lightning fast load time has virtually no impact on your function's performance. You can even define global wildcard routes that will process any incoming request, allowing you to use API Gateway or ALB to determine the routing. Yet despite its small footprint, it gives you the power of a full-featured web framework.

## Table of Contents

- [Simple Example](#simple-example)
- [Why Another Web Framework?](#why-another-web-framework)
  - [Single Purpose Functions](#single-purpose-functions)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Recent Updates](#recent-updates)
  - [v0.11: API Gateway v2 payload support and automatic compression](#v011-api-gateway-v2-payload-support-and-automatic-compression)
  - [v0.10: ALB support, method-based middleware, and multi-value headers and query string parameters](#v010-alb-support-method-based-middleware-and-multi-value-headers-and-query-string-parameters)
- [Routes and HTTP Methods](#routes-and-http-methods)
- [Returning Responses](#returning-responses)
  - [Async/Await](#asyncawait)
  - [Promises](#promises)
  - [A Note About Flow Control](#a-note-about-flow-control)
- [Route Prefixing](#route-prefixing)
- [Debugging Routes](#debugging-routes)
- [REQUEST](#request)
- [RESPONSE](#response)
  - [status(code)](#statuscode)
  - [sendStatus(code)](#sendstatuscode)
  - [header(key, value [,append])](#headerkey-value-append)
  - [getHeader(key [,asArray])](#getheaderkey-asarray)
  - [getHeaders()](#getheaders)
  - [hasHeader(key)](#hasheaderkey)
  - [removeHeader(key)](#removeheaderkey)
  - [getLink(s3Path [, expires] [, callback])](#getlinks3path--expires--callback)
  - [send(body)](#sendbody)
  - [json(body)](#jsonbody)
  - [jsonp(body)](#jsonpbody)
  - [html(body)](#htmlbody)
  - [type(type)](#typetype)
  - [location(path)](#locationpath)
  - [redirect([status,] path)](#redirectstatus-path)
  - [cors([options])](#corsoptions)
  - [error([code], message [,detail])](#errorcode-message-detail)
  - [cookie(name, value [,options])](#cookiename-value-options)
  - [clearCookie(name [,options])](#clearcookiename-options)
  - [etag([boolean])](#etagboolean)
  - [cache([age] [, private])](#cacheage--private)
  - [modified(date)](#modifieddate)
  - [attachment([filename])](#attachmentfilename)
  - [download(file [, filename] [, options] [, callback])](#downloadfile--filename--options--callback)
  - [sendFile(file [, options] [, callback])](#sendfilefile--options--callback)
- [Enabling Binary Support](#enabling-binary-support)
- [Path Parameters](#path-parameters)
- [Wildcard Routes](#wildcard-routes)
- [Logging](#logging)
  - [Logging Configuration](#logging-configuration)
  - [Log Format](#log-format)
  - [Access Logs](#access-logs)
  - [Logging Levels](#logging-levels)
  - [Custom Logging Levels](#custom-logging-levels)
  - [Adding Additional Detail](#adding-additional-detail)
  - [Serializers](#serializers)
  - [Sampling](#sampling)
- [Middleware](#middleware)
  - [Restricting middleware execution to certain path(s)](#restricting-middleware-execution-to-certain-paths)
  - [Specifying multiple middleware](#specifying-multiple-middleware)
  - [Method-based middleware](#method-based-middleware)
- [Clean Up](#clean-up)
- [Error Handling](#error-handling)
  - [Error Types](#error-types)
  - [Error Logging](#error-logging)
- [Namespaces](#namespaces)
- [CORS Support](#cors-support)
- [Compression](#compression)
- [Execution Stacks](#execution-stacks)
- [Lambda Proxy Integration](#lambda-proxy-integration)
- [ALB Integration](#alb-integration)
- [Configuring Routes in API Gateway](#configuring-routes-in-api-gateway)
- [Reusing Persistent Connections](#reusing-persistent-connections)
- [TypeScript Support](#typescript-support)
- [Contributions](#contributions)
- [Are you using Lambda API?](#are-you-using-lambda-api)

## Installation

```
npm i lambda-api --save
```

## Requirements

- AWS Lambda running **Node 8.10+**
- AWS API Gateway using [Proxy Integration](#lambda-proxy-integration)

## Configuration

Require the `lambda-api` module into your Lambda handler script and instantiate it. You can initialize the API with the following options:

| Property             | Type                  | Description                                                                                                                                                                                               |
| -------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| base                 | `String`              | Base path for all routes, e.g. `base: 'v1'` would prefix all routes with `/v1`                                                                                                                            |
| callbackName         | `String`              | Override the default callback query parameter name for JSONP calls                                                                                                                                        |
| logger               | `boolean` or `object` | Enables default [logging](#logging) or allows for configuration through a [Logging Configuration](#logging-configuration) object.                                                                         |
| mimeTypes            | `Object`              | Name/value pairs of additional MIME types to be supported by the `type()`. The key should be the file extension (without the `.`) and the value should be the expected MIME type, e.g. `application/json` |
| serializer           | `Function`            | Optional object serializer function. This function receives the `body` of a response and must return a string. Defaults to `JSON.stringify`                                                               |
| version              | `String`              | Version number accessible via the `REQUEST` object                                                                                                                                                        |
| errorHeaderWhitelist | `Array`               | Array of headers to maintain on errors                                                                                                                                                                    |
| s3Config             | `Object`              | Optional object to provide as config to S3 sdk. [S3ClientConfig](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html)                                 |

```javascript
// Require the framework and instantiate it with optional version and base parameters
const api = require('lambda-api')({ version: 'v1.0', base: 'v1' });
```

## Recent Updates

For detailed release notes see [Releases](https://github.com/jeremydaly/lambda-api/releases).

### v0.11: API Gateway v2 payload support and automatic compression

Lambda API now supports API Gateway v2 payloads for use with HTTP APIs. The library automatically detects the payload, so no extra configuration is needed. Automatic [compression](#compression) has also been added and supports Brotli, Gzip and Deflate.

### v0.10: ALB support, method-based middleware, and multi-value headers and query string parameters

Lambda API now allows you to seamlessly switch between API Gateway and Application Load Balancers. New [execution stacks](execution-stacks) enables method-based middleware and more wildcard functionality. Plus full support for multi-value headers and query string parameters.

## Routes and HTTP Methods

Routes are defined by using convenience methods or the `METHOD` method. There are currently eight convenience route methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `head()`, `options()` and `any()`. Convenience route methods require an optional _route_ and one or more handler functions. A _route_ is simply a path such as `/users`. If a _route_ is not provided, then it will default to `/*` and will execute on every path. Handler functions accept a `REQUEST`, `RESPONSE`, and optional `next()` argument. These arguments can be named whatever you like, but convention dictates `req`, `res`, and `next`.

Multiple handler functions can be assigned to a path, which can be used to execute middleware for specific paths and methods. For more information, see [Middleware](#middleware) and [Execution Stacks](#execution-stacks).

Examples using convenience route methods:

```javascript
api.get('/users', (req,res) => {
  // do something
})

api.post('/users', (req,res) => {
  // do something
})

api.delete('/users', (req,res) => {
  // do something
})

api.get('/users',
  (req,res,next) => {
    // do some middleware
    next() // continue execution
  }),
  (req,res) => {
    // do something
  }
)

api.post((req,res) => {
  // do something for ALL post requests
})

```

Additional methods are support by calling `METHOD`. Arguments must include an HTTP method (or array of methods), an optional _route_, and one or more handler functions. Like the convenience methods above, handler functions accept a `REQUEST`, `RESPONSE`, and optional `next` argument.

```javascript
api.METHOD('trace','/users', (req,res) => {
  // do something on TRACE
})

api.METHOD(['post','put'],'/users', (req,res) => {
  // do something on POST -or- PUT
})

api.METHOD('get','/users',
  (req,res,next) => {
    // do some middleware
    next() // continue execution
  }),
  (req,res) => {
  // do something
  }
)
```

All `GET` methods have a `HEAD` alias that executes the `GET` request but returns a blank `body`. `GET` requests should be idempotent with no side effects. The `head()` convenience method can be used to set specific paths for `HEAD` requests or to override default `GET` aliasing.

Routes that use the `any()` method or pass `ANY` to `api.METHOD` will respond to all HTTP methods. Routes that specify a specific method (such as `GET` or `POST`), will override the route for that method. For example:

```javascript
api.any('/users', (req, res) => {
  res.send('any');
});
api.get('/users', (req, res) => {
  res.send('get');
});
```

A `POST` to `/users` will return "any", but a `GET` request would return "get". Please note that routes defined with an `ANY` method will override default `HEAD` aliasing for `GET` routes.

## Returning Responses

Lambda API supports both `callback-style` and `async-await` for returning responses to users. The [RESPONSE](#response) object has several callbacks that will trigger a response (`send()`, `json()`, `html()`, etc.) You can use any of these callbacks from within route functions and middleware to send the response:

```javascript
api.get('/users', (req, res) => {
  res.send({ foo: 'bar' });
});
```

You can also `return` data from route functions and middleware. The contents will be sent as the body:

```javascript
api.get('/users', (req, res) => {
  return { foo: 'bar' };
});
```

### Async/Await

If you prefer to use `async/await`, you can easily apply this to your route functions.

Using `return`:

```javascript
api.get('/users', async (req, res) => {
  let users = await getUsers();
  return users;
});
```

Or using callbacks:

```javascript
api.get('/users', async (req, res) => {
  let users = await getUsers();
  res.send(users);
});
```

### Promises

If you like promises, you can either use a callback like `res.send()` at the end of your promise chain, or you can simply `return` the resolved promise:

```javascript
api.get('/users', (req, res) => {
  getUsers().then((users) => {
    res.send(users);
  });
});
```

OR

```javascript
api.get('/users', (req, res) => {
  return getUsers().then((users) => {
    return users;
  });
});
```

**IMPORTANT:** You must either use a callback like `res.send()` **OR** `return` a value. Otherwise the execution will hang and no data will be sent to the user. Also, be sure not to return `undefined`, otherwise it will assume no response.

### A Note About Flow Control

While callbacks like `res.send()` and `res.error()` will trigger a response, they will not necessarily terminate execution of the current route function. Take a look at the following example:

```javascript
api.get('/users', (req, res) => {
  if (req.headers.test === 'test') {
    res.error('Throw an error');
  }

  return { foo: 'bar' };
});
```

The example above would not have the intended result of displaying an error. `res.error()` would signal Lambda API to execute the error handling, but the function would continue to run. This would cause the function to `return` a response that would override the intended error. In this situation, you could either wrap the return in an `else` clause, or a cleaner approach would be to `return` the call to the `error()` method, like so:

```javascript
api.get('/users', (req, res) => {
  if (req.headers.test === 'test') {
    return res.error('Throw an error');
  }

  return { foo: 'bar' };
});
```

`res.error()` does not have a return value (meaning it is `undefined`). However, the `return` tells the function to stop executing, and the call to `res.error()` handles and formats the appropriate response. This will allow Lambda API to properly return the expected results.

## Route Prefixing

Lambda API makes it easy to create multiple versions of the same api without changing routes by hand. The `register()` method allows you to load routes from an external file and prefix all of those routes using the `prefix` option. For example:

```javascript
// handler.js
const api = require('lambda-api')();

api.register(require('./routes/v1/products'), { prefix: '/v1' });
api.register(require('./routes/v2/products'), { prefix: '/v2' });

module.exports.handler = (event, context, callback) => {
  api.run(event, context, callback);
};
```

```javascript
// routes/v1/products.js
module.exports = (api, opts) => {
  api.get('/product', handler_v1);
};
```

```javascript
// routes/v2/products.js
module.exports = (api, opts) => {
  api.get('/product', handler_v2);
};
```

Even though both modules create a `/product` route, Lambda API will add the `prefix` to them, creating two unique routes. Your users can now access:

- `/v1/product`
- `/v2/product`

You can use `register()` as many times as you want AND it is recursive, so if you nest `register()` methods, the routes will build upon each other. For example:

```javascript
module.exports = (api, opts) => {
  api.get('/product', handler_v1);
  api.register(require('./v2/products.js'), { prefix: '/v2' });
};
```

This would create a `/v1/product` and `/v1/v2/product` route. You can also use `register()` to load routes from an external file without the `prefix`. This will just add routes to your `base` path. **NOTE:** Prefixed routes are built off of your `base` path if one is set. If your `base` was set to `/api`, then the first example above would produce the routes: `/api/v1/product` and `/api/v2/product`.

## Debugging Routes

Lambda API has a `routes()` method that can be called on the main instance that will return an array containing the `METHOD` and full `PATH` of every configured route. This will include base paths and prefixed routes. This is helpful for debugging your routes.

```javascript
const api = require('lambda-api')();

api.get('/', (req, res) => {});
api.post('/test', (req, res) => {});

api.routes(); // => [ [ 'GET', '/' ], [ 'POST', '/test' ] ]
```

You can also log the paths in table form to the console by passing in `true` as the only parameter.

```javascript
 const api = require('lambda-api')()

 api.get('/', (req,res) => {})
 api.post('/test', (req,res) => {})

 api.routes(true)

// Outputs to console
╔═══════════╤═════════════════╗
║  METHOD   │  ROUTE          ║
╟───────────┼─────────────────╢
║  GET      │  /              ║
╟───────────┼─────────────────╢
║  POST     │  /test          ║
╚═══════════╧═════════════════╝
```

## REQUEST

The `REQUEST` object contains a parsed and normalized request from API Gateway. It contains the following values by default:

- `app`: A reference to an instance of the app
- `version`: The version set at initialization
- `id`: The awsRequestId from the Lambda `context`
- `interface`: The interface being used to access Lambda (`apigateway`,`alb`, or `edge`)
- `params`: Dynamic path parameters parsed from the path (see [path parameters](#path-parameters))
- `method`: The HTTP method of the request
- `path`: The path passed in by the request including the `base` and any `prefix` assigned to routes
- `query`: Querystring parameters parsed into an object
- `multiValueQuery`: Querystring parameters with multiple values parsed into an object with array values
- `headers`: An object containing the request headers (properties converted to lowercase for HTTP/2, see [rfc7540 8.1.2. HTTP Header Fields](https://tools.ietf.org/html/rfc7540)). Note that multi-value headers are concatenated with a comma per [rfc2616 4.2. Message Headers](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2).
- `rawHeaders`: An object containing the original request headers (property case preserved)
- `multiValueHeaders`: An object containing header values as multi-value arrays
- `body`: The body of the request. If the `isBase64Encoded` flag is `true`, it will be decoded automatically.
  - If the `content-type` header is `application/json`, it will attempt to parse the request using `JSON.parse()`
  - If the `content-type` header is `application/x-www-form-urlencoded`, it will attempt to parse a URL encoded string using `querystring`
  - Otherwise it will be plain text.
- `rawBody`: If the `isBase64Encoded` flag is `true`, this is a copy of the original, base64 encoded body
- `route`: The matched route of the request
- `requestContext`: The `requestContext` passed from the API Gateway
- `pathParameters`: The `pathParameters` passed from the API Gateway
- `stageVariables`: The `stageVariables` passed from the API Gateway
- `isBase64Encoded`: The `isBase64Encoded` boolean passed from the API Gateway
- `auth`: An object containing the `type` and `value` of an authorization header. Currently supports `Bearer`, `Basic`, `OAuth`, and `Digest` schemas. For the `Basic` schema, the object is extended with additional fields for username/password. For the `OAuth` schema, the object is extended with key/value pairs of the supplied OAuth 1.0 values.
- `namespace` or `ns`: A reference to modules added to the app's namespace (see [namespaces](#namespaces))
- `cookies`: An object containing cookies sent from the browser (see the [cookie](#cookiename-value-options) `RESPONSE` method)
- `context`: Reference to the `context` passed into the Lambda handler function
- `coldStart`: Boolean that indicates whether or not the current invocation was a cold start
- `requestCount`: Integer representing the total number of invocations of the current function container (how many times it has been reused)
- `ip`: The IP address of the client making the request
- `userAgent`: The `User-Agent` header sent by the client making the request
- `clientType`: Either `desktop`, `mobile`, `tv`, `tablet` or `unknown` based on CloudFront's analysis of the `User-Agent` header
- `clientCountry`: Two letter country code representing the origin of the requests as determined by CloudFront
- `stack`: An array of function names executed as part of a route's [Execution Stack](#execution-stack), which is useful for debugging

The request object can be used to pass additional information through the processing chain. For example, if you are using a piece of authentication middleware, you can add additional keys to the `REQUEST` object with information about the user. See [middleware](#middleware) for more information.

## RESPONSE

The `RESPONSE` object is used to send a response back to the API Gateway. The `RESPONSE` object contains several methods to manipulate responses. All methods are chainable unless they trigger a response.

### status(code)

The `status` method allows you to set the status code that is returned to API Gateway. By default this will be set to `200` for normal requests or `500` on a thrown error. Additional built-in errors such as `404 Not Found` and `405 Method Not Allowed` may also be returned. The `status()` method accepts a single integer argument.

```javascript
api.get('/users', (req, res) => {
  res.status(304).send('Not Modified');
});
```

### sendStatus(code)

The `sendStatus` method sets the status code and returns its string representation as the response body. The `sendStatus()` method accepts a single integer argument.

```javascript
res.sendStatus(200); // equivalent to res.status(200).send('OK')
res.sendStatus(304); // equivalent to res.status(304).send('Not Modified')
res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
```

**NOTE:** If an unsupported status code is provided, it will return 'Unknown' as the body.

### header(key, value [,append])

The `header` method allows for you to set additional headers to return to the client. By default, just the `content-type` header is sent with `application/json` as the value. Headers can be added or overwritten by calling the `header()` method with two string arguments. The first is the name of the header and then second is the value. You can utilize multi-value headers by specifying an array with multiple values as the `value`, or you can use an optional third boolean parameter and append multiple headers.

```javascript
api.get('/users', (req, res) => {
  res.header('content-type', 'text/html').send('<div>This is HTML</div>');
});

// Set multiple header values
api.get('/users', (req, res) => {
  res.header('someHeader', ['foo', 'bar']).send({});
});

// Set multiple header by adding to existing header
api.get('/users', (req, res) => {
  res
    .header('someHeader', 'foo')
    .header('someHeader', 'bar', true) // append another value
    .send({});
});
```

**NOTE:** Header keys are converted and stored as lowercase in compliance with [rfc7540 8.1.2. HTTP Header Fields](https://tools.ietf.org/html/rfc7540) for HTTP/2. Header convenience methods (`getHeader`, `hasHeader`, and `removeHeader`) automatically ignore case.

### getHeader(key [,asArray])

Retrieve a specific header value. `key` is case insensitive. By default (and for backwards compatibility), header values are returned as a `string`. Multi-value headers will be concatenated using a comma (see [rfc2616 4.2. Message Headers](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)). An optional second boolean parameter can be passed to return header values as an `array`.

**NOTE:** The ability to retrieve the current header object by calling `getHeader()` is still possible, but the preferred method is to use the `getHeaders()` method. By default, `getHeader()` will return the object with `string` values.

### getHeaders()

Retrieve the current header object. Values are returned as `array`s.

### hasHeader(key)

Returns a boolean indicating the existence of `key` in the response headers. `key` is case insensitive.

### removeHeader(key)

Removes header matching `key` from the response headers. `key` is case insensitive. This method is chainable.

### getLink(s3Path [, expires] [, callback])

This returns a signed URL to the referenced file in S3 (using the `s3://{my-bucket}/{path-to-file}` format). You can optionally pass in an integer as the second parameter that will changed the default expiration time of the link. The expiration time is in seconds and defaults to `900`. In order to ensure proper URL signing, the `getLink()` must be asynchronous, and therefore returns a promise. You must either `await` the result or use a `.then` to retrieve the value.

There is an optional third parameter that takes an error handler callback. If the underlying `getSignedUrl()` call fails, the error will be returned using the standard `res.error()` method. You can override this by providing your own callback.

```javascript
// async/await
api.get('/getLink', async (req, res) => {
  let url = await res.getLink('s3://my-bucket/my-file.pdf');
  return { link: url };
});

// promises
api.get('/getLink', (req, res) => {
  res.getLink('s3://my-bucket/my-file.pdf').then((url) => {
    res.json({ link: url });
  });
});
```

### send(body)

The `send` methods triggers the API to return data to the API Gateway. The `send` method accepts one parameter and sends the contents through as is, e.g. as an object, string, integer, etc. AWS Gateway expects a string, so the data should be converted accordingly.

### json(body)

There is a `json` convenience method for the `send` method that will set the headers to `application/json` as well as perform `JSON.stringify()` on the contents passed to it.

```javascript
api.get('/users', (req, res) => {
  res.json({ message: 'This will be converted automatically' });
});
```

### jsonp(body)

There is a `jsonp` convenience method for the `send` method that will set the headers to `application/json`, perform `JSON.stringify()` on the contents passed to it, and wrap the results in a callback function. By default, the callback function is named `callback`.

```javascript
res.jsonp({ foo: 'bar' });
// => callback({ "foo": "bar" })

res.status(500).jsonp({ error: 'some error' });
// => callback({ "error": "some error" })
```

The default can be changed by passing in `callback` as a URL parameter, e.g. `?callback=foo`.

```javascript
// ?callback=foo
res.jsonp({ foo: 'bar' });
// => foo({ "foo": "bar" })
```

You can change the default URL parameter using the optional `callback` option when initializing the API.

```javascript
const api = require('lambda-api')({ callback: 'cb' });

// ?cb=bar
res.jsonp({ foo: 'bar' });
// => bar({ "foo": "bar" })
```

### html(body)

There is also an `html` convenience method for the `send` method that will set the headers to `text/html` and pass through the contents.

```javascript
api.get('/users', (req, res) => {
  res.html('<div>This is HTML</div>');
});
```

### type(type)

Sets the `content-type` header for you based on a single `String` input. There are thousands of MIME types, many of which are likely never to be used by your application. Lambda API stores a list of the most popular file types and will automatically set the correct `content-type` based on the input. If the `type` contains the "/" character, then it sets the `content-type` to the value of `type`.

```javascript
res.type('.html'); // => 'text/html'
res.type('html'); // => 'text/html'
res.type('json'); // => 'application/json'
res.type('application/json'); // => 'application/json'
res.type('png'); // => 'image/png'
res.type('.doc'); // => 'application/msword'
res.type('text/css'); // => 'text/css'
```

For a complete list of auto supported types, see [mimemap.js](lib/mimemap.js). Custom MIME types can be added by using the `mimeTypes` option when instantiating Lambda API

### location(path)

The `location` convenience method sets the `Location:` header with the value of a single string argument. The value passed in is not validated but will be encoded before being added to the header. Values that are already encoded can be safely passed in. Note that a valid `3xx` status code must be set to trigger browser redirection. The value can be a relative/absolute path OR a FQDN.

```javascript
api.get('/redirectToHome', (req, res) => {
  res.location('/home').status(302).html('<div>Redirect to Home</div>');
});

api.get('/redirectToGithub', (req, res) => {
  res
    .location('https://github.com')
    .status(302)
    .html('<div>Redirect to GitHub</div>');
});
```

### redirect([status,] path)

The `redirect` convenience method triggers a redirection and ends the current API execution. This method is similar to the `location()` method, but it automatically sets the status code and calls `send()`. The redirection URL (relative/absolute path, a FQDN, or an S3 path reference) can be specified as the only parameter or as a second parameter when a valid `3xx` status code is supplied as the first parameter. The status code is set to `302` by default, but can be changed to `300`, `301`, `302`, `303`, `307`, or `308` by adding it as the first parameter.

```javascript
api.get('/redirectToHome', (req, res) => {
  res.redirect('/home');
});

api.get('/redirectToGithub', (req, res) => {
  res.redirect(301, 'https://github.com');
});

// This will redirect a signed URL using the getLink method
api.get('/redirectToS3File', (req, res) => {
  res.redirect('s3://my-bucket/someFile.pdf');
});
```

### cors([options])

Convenience method for adding [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) headers to responses. An optional `options` object can be passed in to customize the defaults.

The six defined **CORS** headers are as follows:

- Access-Control-Allow-Origin (defaults to `*`)
- Access-Control-Allow-Methods (defaults to `GET, PUT, POST, DELETE, OPTIONS`)
- Access-Control-Allow-Headers (defaults to `Content-Type, Authorization, Content-Length, X-Requested-With`)
- Access-Control-Expose-Headers
- Access-Control-Max-Age
- Access-Control-Allow-Credentials

The `options` object can contain the following properties that correspond to the above headers:

- origin _(string)_
- methods _(string)_
- headers _(string)_
- exposeHeaders _(string)_
- maxAge _(number in milliseconds)_
- credentials _(boolean)_

Defaults can be set by calling `res.cors()` with no properties, or with any combination of the above options.

```javascript
res.cors({
  origin: 'example.com',
  methods: 'GET, POST, OPTIONS',
  headers: 'content-type, authorization',
  maxAge: 84000000,
});
```

You can override existing values by calling `res.cors()` with just the updated values:

```javascript
res.cors({
  origin: 'api.example.com',
});
```

### error([code], message [,detail])

An error can be triggered by calling the `error` method. This will cause the API to stop execution and return the message to the client. The status code can be set by optionally passing in an integer as the first parameter. Additional detail can be added as an optional third parameter (or second parameter if no status code is passed). This will add an additional `detail` property to error logs. Details accepts any value that can be serialized by `JSON.stringify` including objects, strings and arrays. Custom error handling can be accomplished using the [Error Handling](#error-handling) feature.

```javascript
api.get('/users', (req, res) => {
  res.error('This is an error');
});

api.get('/users', (req, res) => {
  res.error(403, 'Not authorized');
});

api.get('/users', (req, res) => {
  res.error('Error', { foo: 'bar' });
});

api.get('/users', (req, res) => {
  res.error(404, 'Page not found', 'foo bar');
});
```

### cookie(name, value [,options])

Convenience method for setting cookies. This method accepts a `name`, `value` and an optional `options` object with the following parameters:

| Property | Type                  | Description                                                                                                                                                                                                 |
| -------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| domain   | `String`              | Domain name to use for the cookie. This defaults to the current domain.                                                                                                                                     |
| expires  | `Date`                | The expiration date of the cookie. Local dates will be converted to GMT. Creates session cookie if this value is not specified.                                                                             |
| httpOnly | `Boolean`             | Sets the cookie to be accessible only via a web server, not JavaScript.                                                                                                                                     |
| maxAge   | `Number`              | Set the expiration time relative to the current time in milliseconds. Automatically sets the `expires` property if not explicitly provided.                                                                 |
| path     | `String`              | Path for the cookie. Defaults to "/" for the root directory.                                                                                                                                                |
| secure   | `Boolean`             | Sets the cookie to be used with HTTPS only.                                                                                                                                                                 |
| sameSite | `Boolean` or `String` | Sets the SameSite value for cookie. `true` or `false` sets `Strict` or `Lax` respectively. Also allows a string value. See https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1 |

The `name` attribute should be a string (auto-converted if not), but the `value` attribute can be any type of value. The `value` will be serialized (if an object, array, etc.) and then encoded using `encodeURIComponent` for safely assigning the cookie value. Cookies are automatically parsed, decoded, and available via the `REQUEST` object (see [REQUEST](#request)).

**NOTE:** The `cookie()` method only sets the header. A execution ending method like `send()`, `json()`, etc. must be called to send the response.

```javascript
res.cookie('foo', 'bar', { maxAge: 3600 * 1000, secure: true }).send();
res
  .cookie(
    'fooObject',
    { foo: 'bar' },
    { domain: '.test.com', path: '/admin', httpOnly: true }
  )
  .send();
res
  .cookie('fooArray', ['one', 'two', 'three'], { path: '/', httpOnly: true })
  .send();
```

### clearCookie(name [,options])

Convenience method for expiring cookies. Requires the `name` and optional `options` object as specified in the [cookie](#cookiename-value-options) method. This method will automatically set the expiration time. However, most browsers require the same options to clear a cookie as was used to set it. E.g. if you set the `path` to "/admin" when you set the cookie, you must use this same value to clear it.

```javascript
res.clearCookie('foo', { secure: true }).send();
res
  .clearCookie('fooObject', {
    domain: '.test.com',
    path: '/admin',
    httpOnly: true,
  })
  .send();
res.clearCookie('fooArray', { path: '/', httpOnly: true }).send();
```

**NOTE:** The `clearCookie()` method only sets the header. A execution ending method like `send()`, `json()`, etc. must be called to send the response.

### etag([boolean])

Enables Etag generation for the response if at value of `true` is passed in. Lambda API will generate an Etag based on the body of the response and return the appropriate header. If the request contains an `If-No-Match` header that matches the generated Etag, a `304 Not Modified` response will be returned with a blank body.

### cache([age] [, private])

Adds `cache-control` header to responses. If the first parameter is an `integer`, it will add a `max-age` to the header. The number should be in milliseconds. If the first parameter is `true`, it will add the cache headers with `max-age` set to `0` and use the current time for the `expires` header. If set to false, it will add a cache header with `no-cache, no-store, must-revalidate` as the value. You can also provide a custom string that will manually set the value of the `cache-control` header. And optional second argument takes a `boolean` and will set the `cache-control` to `private` This method is chainable.

```javascript
res.cache(false).send(); // 'cache-control': 'no-cache, no-store, must-revalidate'
res.cache(1000).send(); // 'cache-control': 'max-age=1'
res.cache(30000, true).send(); // 'cache-control': 'private, max-age=30'
```

### modified(date)

Adds a `last-modified` header to responses. A value of `true` will set the value to the current date and time. A JavaScript `Date` object can also be passed in. Note that it will be converted to UTC if not already. A `string` can also be passed in and will be converted to a date if JavaScript's `Date()` function is able to parse it. A value of `false` will prevent the header from being generated, but will not remove any existing `last-modified` headers.

### attachment([filename])

Sets the HTTP response `content-disposition` header field to "attachment". If a `filename` is provided, then the `content-type` is set based on the file extension using the `type()` method and the "filename=" parameter is added to the `content-disposition` header.

```javascript
res.attachment();
// content-disposition: attachment

res.attachment('path/to/logo.png');
// content-disposition: attachment; filename="logo.png"
// content-type: image/png
```

### download(file [, filename] [, options] [, callback])

This transfers the `file` (either a local path, S3 file reference, or Javascript `Buffer`) as an "attachment". This is a convenience method that combines `attachment()` and `sendFile()` to prompt the user to download the file. This method optionally takes a `filename` as a second parameter that will overwrite the "filename=" parameter of the `content-disposition` header, otherwise it will use the filename from the `file`. An optional `options` object passes through to the [sendFile()](#sendfilefile--options--callback) method and takes the same parameters. Finally, a optional `callback` method can be defined which is passed through to [sendFile()](#sendfilefile--options--callback) as well.

```javascript
res.download('./files/sales-report.pdf')

res.download('./files/sales-report.pdf', 'report.pdf')

res.download('s3://my-bucket/path/to/file.png', 'logo.png', { maxAge: 3600000 })

res.download(<Buffer>, 'my-file.docx', { maxAge: 3600000 }, (err) => {
  if (err) {
    res.error('Custom File Error')
  }
})
```

### sendFile(file [, options] [, callback])

The `sendFile()` method takes up to three arguments. The first is the `file`. This is either a local filename (stored within your uploaded lambda code), a reference to a file in S3 (using the `s3://{my-bucket}/{path-to-file}` format), or a JavaScript `Buffer`. You can optionally pass an `options` object using the properties below as well as a callback function `callback(err)` that can handle custom errors or manipulate the response before sending to the client.

| Property     | Type                  | Description                                                                                                                                                                | Default |
| ------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| maxAge       | `Number`              | Set the expiration time relative to the current time in milliseconds. Automatically sets the `Expires` header                                                              | 0       |
| root         | `String`              | Root directory for relative filenames.                                                                                                                                     |         |
| lastModified | `Boolean` or `String` | Sets the `last-modified` header to the last modified date of the file. This can be disabled by setting it to `false`, or overridden by setting it to a valid `Date` object |         |
| headers      | `Object`              | Key value pairs of additional headers to be sent with the file                                                                                                             |         |
| cacheControl | `Boolean` or `String` | Enable or disable setting `cache-control` response header. Override value with custom string.                                                                              | true    |
| private      | `Boolean`             | Sets the `cache-control` to `private`.                                                                                                                                     | false   |

```javascript
res.sendFile('./img/logo.png')

res.sendFile('./img/logo.png', { maxAge: 3600000 })

res.sendFile('s3://my-bucket/path/to/file.png', { maxAge: 3600000 })

res.sendFile(<Buffer>, 'my-file.docx', { maxAge: 3600000 }, (err) => {
  if (err) {
    res.error('Custom File Error')
  }
})
```

The `callback` function supports returning a promise, allowing you to perform additional tasks _after_ the file is successfully loaded from the source. This can be used to perform additional synchronous tasks before returning control to the API execution.

**NOTE:** In order to access S3 files, your Lambda function must have `GetObject` access to the files you're attempting to access.

See [Enabling Binary Support](#enabling-binary-support) for more information.

## Enabling Binary Support

To enable binary support, you need to add `*/*` under "Binary Media Types" in **API Gateway** -> **APIs** -> **[ your api ]** -> **Settings**. This will also `base64` encode all body content, but Lambda API will automatically decode it for you.

![Binary Media Types](http://jeremydaly.com//lambda-api/binary-media-types.png)
_Add_ `*/*` _to Binary Media Types_

## Path Parameters

Path parameters are extracted from the path sent in by API Gateway. Although API Gateway supports path parameters, the API doesn't use these values but insteads extracts them from the actual path. This gives you more flexibility with the API Gateway configuration. Path parameters are defined in routes using a colon `:` as a prefix.

```javascript
api.get('/users/:userId', (req, res) => {
  res.send('User ID: ' + req.params.userId);
});
```

Path parameters act as wildcards that capture the value into the `params` object. The example above would match `/users/123` and `/users/test`. The system always looks for static paths first, so if you defined paths for `/users/test` and `/users/:userId`, exact path matches would take precedence. Path parameters only match the part of the path they are defined on. E.g. `/users/456/test` would not match `/users/:userId`. You would either need to define `/users/:userId/test` as its own path, or create another path with an additional path parameter, e.g. `/users/:userId/:anotherParam`.

A path can contain as many parameters as you want. E.g. `/users/:param1/:param2/:param3`.

## Wildcard Routes

Wildcard routes are supported for matching arbitrary paths. Wildcards only work at the _end of a route definition_ such as `/*` or `/users/*`. Wildcards within a path, e.g. `/users/*/posts` are not supported. Wildcard routes do support parameters, however, so `/users/:id/*` would capture the `:id` parameter in your wildcard handler.

Wildcard routes will match any deep paths after the wildcard. For example, a `GET` method for path `/users/*` would match `/users/1/posts/latest`. The only exception is for the `OPTIONS` method. A path **must** exist for a wildcard on an `OPTIONS` route in order to execute the handler. If a wildcard route is defined for another method higher up the path, then the `OPTIONS` handler will fire. For example, if there was a `POST` method defined on `/users/*`, then an `OPTIONS` method for `/users/2/posts/*` would fire as it assumes that the `POST` path would exist.

In most cases, [Path Parameters](#path-parameters) should be used in favor of wildcard routes. However, if you need to support unpredictable path lengths, or your are building single purpose functions and will be mapping routes from API Gateway, the wildcards are a powerful pattern. Another good use case is to use the `OPTIONS` method to provide CORS headers.

```javascript
api.options('/*', (req, res) => {
  // Return CORS headers
  res.cors().send({});
});
```

## Logging

Lambda API includes a robust logging engine specifically designed to utilize native JSON support for CloudWatch Logs. Not only is it ridiculously fast, but it's also highly configurable. Logging is disabled by default, but can be enabled by passing `{ logger: true }` when you create the Lambda API instance (or by passing a [Logging Configuration](#logging-configuration) definition).

The logger is attached to the `REQUEST` object and can be used anywhere the object is available (e.g. routes, middleware, and error handlers).

```javascript
const api = require('lambda-api')({ logger: true });

api.get('/status', (req, res) => {
  req.log.info('Some info about this route');
  res.send({ status: 'ok' });
});
```

In addition to manual logging, Lambda API can also generate "access" logs for your API requests. API Gateway can also provide access logs, but they are limited to contextual information about your request (see [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)). Lambda API allows you to capture the same data **PLUS** additional information directly from within your application.

### Logging Configuration

Logging can be enabled by setting the `logger` option to `true` when creating the Lambda API instance. Logging can be configured by setting `logger` to an object that contains configuration information. The following table contains available logging configuration properties.

| Property     | Type                    | Description                                                                                                                                                                                | Default       |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| access       | `boolean` or `string`   | Enables/disables automatic access log generation for each request. See [Access Logs](#access-logs).                                                                                        | `false`       |
| errorLogging | `boolean`               | Enables/disables automatic error logging.                                                                                                                                                  | `true`        |
| customKey    | `string`                | Sets the JSON property name for custom data passed to logs.                                                                                                                                | `custom`      |
| detail       | `boolean`               | Enables/disables adding `REQUEST` and `RESPONSE` data to all log entries.                                                                                                                  | `false`       |
| level        | `string`                | Minimum logging level to send logs for. See [Logging Levels](#logging-levels).                                                                                                             | `info`        |
| levels       | `object`                | Key/value pairs of custom log levels and their priority. See [Custom Logging Levels](#custom-logging-levels).                                                                              |               |
| log          | `function`              | Custom function for overriding standard `console.log`.                                                                                                                                     | `console.log` |
| messageKey   | `string`                | Sets the JSON property name of the log "message".                                                                                                                                          | `msg`         |
| multiValue   | `boolean`               | Enables multi-value support for querystrings. If enabled, the `qs` parameter will return all values as `array`s and will include multiple values if they exist.                            | `false`       |
| nested       | `boolean`               | Enables/disables nesting of JSON logs for serializer data. See [Serializers](#serializers).                                                                                                | `false`       |
| timestamp    | `boolean` or `function` | By default, timestamps will return the epoch time in milliseconds. A value of `false` disables log timestamps. A function that returns a value can be used to override the default format. | `true`        |
| sampling     | `object`                | Enables log sampling for periodic request tracing. See [Sampling](#sampling).                                                                                                              |               |
| serializers  | `object`                | Adds serializers that manipulate the log format. See [Serializers](#serializers).                                                                                                          |               |
| stack        | `boolean`               | Enables/disables the inclusion of stack traces in caught errors.                                                                                                                           | `false`       |

Example:

```javascript
const api = require('lambda-api')({
  logger: {
    level: 'debug',
    access: true,
    customKey: 'detail',
    messageKey: 'message',
    timestamp: () => new Date().toUTCString(), // custom timestamp
    stack: true,
  },
});
```

### Log Format

Logs are generated using Lambda API's standard JSON format. The log format can be customized using [Serializers](#serializers).

**Standard log format (manual logging):**

```javascript
  {
    "level": "info", // log level
    "time": 1534724904910, // request timestamp
    "id": "41b45ea3-70b5-11e6-b7bd-69b5aaebc7d9", // awsRequestId
    "route": "/user/:userId", // route accessed
    "method": "GET", // request method
    "msg": "Some info about this route", // log message
    "timer": 2, // execution time up until log was generated
    "custom": "additional data", // addditional custom log detail
    "remaining": 2000, // remaining milliseconds until function timeout
    "function": "my-function-v1", // function name
    "memory": 2048, // allocated function memory
    "int": "apigateway", // interface used to access the Lambda function
    "sample": true // is generated during sampling request?
  }
```

### Access Logs

Access logs generate detailed information about the API request. Access logs are disabled by default, but can be enabled by setting the `access` property to `true` in the logging configuration object. If set to `false`, access logs will _only_ be generated when other log entries (`info`, `error`, etc.) are created. If set to the string `'never'`, access logs will never be generated.

Access logs use the same format as the standard logs above, but include additional information about the request. The access log format can be customized using [Serializers](#serializers).

**Access log format (automatic logging):**

```javascript
  {
    ... Standard Log Data ...,
    "path": "/user/123", // path accessed
    "ip": "12.34.56.78", // client ip address
    "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)...", // User-Agent
    "version": "v1", // specified API version
    "device": "mobile", // client device (as determined by CloudFront)
    "country": "US", // client country (as determined by CloudFront)
    "qs": { // query string parameters
      "foo": "bar"
    }
  }
```

### Logging Levels

Logging "levels" allow you to add detailed logging to your functions based on severity. There are six standard log levels as specified in the table below along with their default priority.

| Level   | Priority |
| ------- | -------- |
| `trace` | 10       |
| `debug` | 20       |
| `info`  | 30       |
| `warn`  | 40       |
| `error` | 50       |
| `fatal` | 60       |

Logs are written to CloudWatch Logs _ONLY_ if they are the same or higher severity than specified in the `level` log configuration.

```javascript
// Logging level set to "warn"
const api = require('lambda-api')({ logger: { level: 'warn' } });

api.get('/', (req, res) => {
  req.log.trace('trace log message'); // ignored
  req.log.debug('debug log message'); // ignored
  req.log.info('info log message'); // ignored
  req.log.warn('warn log message'); // write to CloudWatch
  req.log.error('error log message'); // write to CloudWatch
  req.log.fatal('fatal log message'); // write to CloudWatch
  res.send({ hello: 'world' });
});
```

### Custom Logging Levels

Custom logging "levels" can be added by specifying an object containing "level names" as keys and their priorities as values. You can also adjust the priority of standard levels by adding it to the object.

```javascript
const api = require('lambda-api')({
  logger: {
    levels: {
      test: 5, // low priority 'test' level
      customLevel: 35, // between info and warn
      trace: 70, // set trace to the highest priority
    },
  },
});
```

In the example above, the `test` level would only generate logs if the priority was set to `test`. `customLevel` would generate logs if `level` was set to anything with the same or lower priority (e.g. `info`). `trace` now has the highest priority and would generate a log entry no matter what the level was set to.

### Adding Additional Detail

Manual logging also allows you to specify additional detail with each log entry. Details can be added by suppling _any variable type_ as a second parameter to the logger function.

```javascript
req.log.info('This is the main log message', 'some other detail'); // string
req.log.info('This is the main log message', {
  foo: 'bar',
  isAuthorized: someVar,
}); // object
req.log.info('This is the main log message', 25); // number
req.log.info('This is the main log message', ['val1', 'val2', 'val3']); // array
req.log.info('This is the main log message', true); // boolean
```

If an `object` is provided, the keys will be merged into the main log entry's JSON. If any other `type` is provided, the value will be assigned to a key using the the `customKey` setting as its property name. If `nested` is set to `true`, objects will be nested under the value of `customKey` as well.

### Serializers

Serializers allow you to customize log formats as well as add additional data from your application. Serializers can be defined by adding a `serializers` property to the `logger` configuration object. A property named for an available serializer (`main`, `req`, `res`, `context` or `custom`) needs to return an anonymous function that takes one argument and returns an object. The returned object will be merged into the main JSON log entry. Existing properties can be removed by returning `undefined` as their values.

```javascript
const api = require('lambda-api')({
  logger: {
    serializers: {
      req: (req) => {
        return {
          apiId: req.requestContext.apiId, // add the apiId
          stage: req.requestContext.stage, // add the stage
          qs: undefined, // remove the query string
        };
      },
    },
  },
});
```

Serializers are passed one argument that contains their corresponding object. `req` _and_ `main` receive the `REQUEST` object, `res` receives the `RESPONSE` object, `context` receives the `context` object passed into the main `run` function, and `custom` receives custom data passed in to the logging methods. Note that only custom `objects` will trigger the `custom` serializer.

If the `nested` option is set to true in the `logger` configuration, then JSON log entries will be generated with properties for `req`, `res`, `context` and `custom` with their serialized data as nested objects.

### Sampling

Sampling allows you to periodically generate log entries for all possible severities within a single request execution. All of the log entries will be written to CloudWatch Logs and can be used to trace an entire request. This can be used for debugging, metric samples, resource response time sampling, etc.

Sampling can be enabled by adding a `sampling` property to the `logger` configuration object. A value of `true` will enable the default sampling rule. The default can be changed by passing in a configuration object with the following available _optional_ properties:

| Property | Type     | Description                                                              | Default |
| -------- | -------- | ------------------------------------------------------------------------ | ------- |
| target   | `number` | The minimum number of samples per `period`.                              | 1       |
| rate     | `number` | The percentage of samples to be taken during the `period`.               | 0.1     |
| period   | `number` | Number of **seconds** representing the duration of each sampling period. | 60      |

The example below would sample at least `2` requests every `30` seconds as well as an additional `0.1` (10%) of all other requests during that period. Lambda API tracks the velocity of requests and attempts to distribute the samples as evenly as possible across the specified `period`.

```javascript
const api = require('lambda-api')({
  logger: {
    sampling: {
      target: 2,
      rate: 0.1,
      period: 30,
    },
  },
});
```

Additional rules can be added by specifying a `rules` parameter in the `sampling` configuration object. The `rules` should contain an `array` of "rule" objects with the following properties:

| Property | Type                | Description                                                              | Default | Required |
| -------- | ------------------- | ------------------------------------------------------------------------ | ------- | -------- |
| route    | `string`            | The route (as defined in a route handler) to apply this rule to.         |         | **Yes**  |
| target   | `number`            | The minimum number of samples per `period`.                              | 1       | No       |
| rate     | `number`            | The percentage of samples to be taken during the `period`.               | 0.1     | No       |
| period   | `number`            | Number of **seconds** representing the duration of each sampling period. | 60      | No       |
| method   | `string` or `array` | A comma separated list or `array` of HTTP methods to apply this rule to. |         | No       |

The `route` property is the only value required and must match a route's path definition (e.g. `/user/:userId`, not `/user/123`) to be activated. Routes can also use wildcards at the end of the route to match multiple routes (e.g. `/user/*` would match `/user/:userId` _AND_ `/user/:userId/tags`). A list of `method`s can also be supplied that would limit the rule to just those HTTP methods. A comma separated `string` or an `array` will be properly parsed.

Sampling rules can be used to disable sampling on certain routes by setting the `target` and `rate` to `0`. For example, if you had a `/status` route that you didn't want to be sampled, you would use the following configuration:

```javascript
const api = require('lambda-api')({
  logger: {
    sampling: {
      rules: [{ route: '/status', target: 0, rate: 0 }],
    },
  },
});
```

You could also use sampling rules to enable sampling on certain routes:

```javascript
const api = require('lambda-api')({
  logger: {
    sampling: {
      rules: [
        { route: '/user', target: 1, rate: 0.1 }, // enable for /user route
        { route: '/posts/*', target: 1, rate: 0.1 }, // enable for all routes that start with /posts
      ],
      target: 0, // disable sampling default target
      rate: 0, // disable sampling default rate
    },
  },
});
```

If you'd like to disable sampling for `GET` and `POST` requests to user:

```javascript
const api = require('lambda-api')({
  logger: {
    sampling: {
      rules: [
        // disable GET and POST on /user route
        { route: '/user', target: 0, rate: 0, method: ['GET', 'POST'] },
      ],
    },
  },
});
```

Any combination of rules can be provided to customize sampling behavior. Note that each rule tracks requests and velocity separately, which could limit the number of samples for infrequently accessed routes.

## Middleware

The API supports middleware to preprocess requests before they execute their matching routes. Global middleware is defined using the `use` method one or more functions with three parameters for the `REQUEST`, `RESPONSE`, and `next` callback. For example:

```javascript
api.use((req, res, next) => {
  // do something
  next();
});
```

Middleware can be used to authenticate requests, create database connections, etc. The `REQUEST` and `RESPONSE` objects behave as they do within routes, allowing you to manipulate either object. In the case of authentication, for example, you could verify a request and update the `REQUEST` with an `authorized` flag and continue execution. Or if the request couldn't be authorized, you could respond with an error directly from the middleware. For example:

```javascript
// Auth User
api.use((req, res, next) => {
  if (req.headers.authorization === 'some value') {
    req.authorized = true;
    next(); // continue execution
  } else {
    res.error(401, 'Not Authorized');
  }
});
```

The `next()` callback tells the system to continue executing. If this is not called then the system will hang (and eventually timeout) unless another request ending call such as `error` is called. You can define as many middleware functions as you want. They will execute serially and synchronously in the order in which they are defined.

**NOTE:** Middleware can use either callbacks like `res.send()` or `return` to trigger a response to the user. Please note that calling either one of these from within a middleware function will return the response immediately and terminate API execution.

### Restricting middleware execution to certain path(s)

By default, middleware will execute on every path. If you only need it to execute for specific paths, pass the path (or array of paths) as the first parameter to the `use` method.

```javascript
// Single path
api.use('/users', (req, res, next) => {
  next();
});

// Wildcard path
api.use('/users/*', (req, res, next) => {
  next();
});

// Multiple path
api.use(['/users', '/posts'], (req, res, next) => {
  next();
});

// Parameterized paths
api.use('/users/:userId', (req, res, next) => {
  next();
});

// Multiple paths with parameters and wildcards
api.use(['/comments', '/users/:userId', '/posts/*'], (req, res, next) => {
  next();
});
```

**NOTE:** Path matching checks the defined `route`. This means that parameterized paths must be matched by the parameter (e.g. `/users/:param1`).

### Specifying multiple middleware

In addition to restricting middleware to certain paths, you can also add multiple middleware using a single `use` method. This is a convenient way to assign several pieces of middleware to the same path or minimize your code.

```javascript
const middleware1 = (req, res, next) => {
  // middleware code
};

const middleware2 = (req, res, next) => {
  // some other middleware code
};

// Restrict middleware1 and middleware2 to /users route
api.use('/users', middleware1, middleware2);

// Add middleware1 and middleware2 to all routes
api.use(middleware1, middleware2);
```

### Method-based middleware

Middleware can be restricted to a specific method (or array of methods) by using the route convenience methods or `METHOD`. Method-based middleware behaves exactly like global middleware, requiring a `REQUEST`, `RESPONSE`, and `next` parameter. You can specify multiple middlewares for each method/path using a single method call, or by using multiple method calls. Lambda API will merge the [execution stacks](#execution-stacks) for you.

```javascript
const middleware1 = (req, res, next) => {
  // middleware code
};

const middleware2 = (req, res, next) => {
  // middleware code
};

// Execute middleware1 and middleware2 on /users route
api.get('/users', middleware1, middleware2, (req, res) => {
  // handler function
});

// Execute middleware1 on /users route
api.get('/users', middleware1);

// Add middleware2 and handler
api.get('/users', middleware2, (req, res) => {
  // handler function
});
```

## Clean Up

The API has a built-in clean up method called 'finally()' that will execute after all middleware and routes have been completed, but before execution is complete. This can be used to close database connections or to perform other clean up functions. A clean up function can be defined using the `finally` method and requires a function with two parameters for the REQUEST and the RESPONSE as its only argument. For example:

```javascript
api.finally((req, res) => {
  // close unneeded database connections and perform clean up
});
```

The `RESPONSE` **CANNOT** be manipulated since it has already been generated. Only one `finally()` method can be defined and will execute after properly handled errors as well.

## Error Handling

Lambda API has sophisticated error handling that will automatically catch and log errors using the [Logging](#logging) system. By default, errors will trigger a JSON response with the error message. If you would like to define additional error handling, you can define them using the `use` method similar to middleware. Error handling middleware must be defined as a function with **four** arguments instead of three like normal middleware. An additional `error` parameter must be added as the first parameter. This will contain the error object generated.

```javascript
api.use((err, req, res, next) => {
  // do something with the error
  next();
});
```

The `next()` callback will cause the script to continue executing and eventually call the standard error handling function. You can short-circuit the default handler by calling a request ending method such as `send`, `html`, or `json` OR by `return`ing data from your handler.

Error handling middleware, like regular middleware, also supports specifying multiple handlers in a single `use` method call.

```javascript
const errorHandler1 = (err,req,res,next) => {
  // do something with the error
  next()
})

const errorHandler2 = (err,req,res,next) => {
  // do something else with the error
  next()
})

api.use(errorHandler1,errorHandler2)
```

**NOTE:** Error handling middleware runs on _ALL_ paths. If paths are passed in as the first parameter, they will be ignored by the error handling middleware.

### Error Types

Lambda API provides several different types of errors that can be used by your application. `RouteError`, `MethodError`, `ResponseError`, and `FileError` will all be passed to your error middleware. `ConfigurationError`s will throw an exception when you attempt to `.run()` your route and can be caught in a `try/catch` block. Most error types contain additional properties that further detail the issue.

```javascript
const errorHandler = (err,req,res,next) => {

  if (err.name === 'RouteError') {
    // do something with route error
  } else if (err.name === 'FileError') {
    // do something with file error
  }
  // continue
  next()
})
```

### Error Logging

Error logs are generated using either the `error` or `fatal` logging level. Errors can be triggered from within routes and middleware by calling the `error()` method on the `RESPONSE` object. If provided a `string` as an error message, this will generate an `error` level log entry. If you supply a JavaScript `Error` object, or you `throw` an error, a `fatal` log entry will be generated.

```javascript
api.get('/somePath', (res, req) => {
  res.error('This is an error message'); // creates 'error' log
});

api.get('/someOtherPath', (res, req) => {
  res.error(new Error('This is a fatal error')); // creates 'fatal' log
});

api.get('/anotherPath', (res, req) => {
  throw new Error('Another fatal error'); // creates 'fatal' log
});

api.get('/finalPath', (res, req) => {
  try {
    // do something
  } catch (e) {
    res.error(e); // creates 'fatal' log
  }
});
```

## Namespaces

Lambda API allows you to map specific modules to namespaces that can be accessed from the `REQUEST` object. This is helpful when using the pattern in which you create a module that exports middleware, error, or route functions. In the example below, the `data` namespace is added to the API and then accessed by reference within an included module.

The main handler file might look like this:

```javascript
// Use app() function to add 'data' namespace
api.app('data', require('./lib/data.js'));

// Create a get route to load user details
api.get('/users/:userId', require('./lib/users.js'));
```

The users.js module might look like this:

```javascript
module.exports = (req, res) => {
  let userInfo = req.namespace.data.getUser(req.params.userId);
  res.json({ userInfo: userInfo });
};
```

By saving references in namespaces, you can access them without needing to require them in every module. Namespaces can be added using the `app()` method of the API. `app()` accepts either two parameters: a string representing the name of the namespace and a function reference _OR_ an object with string names as keys and function references as the values. For example:

```javascript
api.app('namespace', require('./lib/ns-functions.js'));

// OR

api.app({
  namespace1: require('./lib/ns1-functions.js'),
  namespace2: require('./lib/ns2-functions.js'),
});
```

## CORS Support

CORS can be implemented using the [wildcard routes](#wildcard-routes) feature. A typical implementation would be as follows:

```javascript
api.options('/*', (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );
  res.status(200).send({});
});
```

You can also use the `cors()` ([see here](#corsoptions)) convenience method to add CORS headers.

Conditional route support could be added via middleware or with conditional logic within the `OPTIONS` route.

## Compression

Currently, API Gateway HTTP APIs do not support automatic compression, but that doesn't mean the Lambda can't return a compressed response. Lambda API supports compression out of the box:

```javascript
const api = require('lambda-api')({
  compression: true,
});
```

The response will automatically be compressed based on the `Accept-Encoding` header in the request. Supported compressions are Gzip and Deflate, with opt-in support for Brotli:

```javascript
const api = require('lambda-api')({
  compression: ['br', 'gzip'],
});
```

> Note: Brotli compression is significantly slower than Gzip due to its CPU intensive algorithm. Please test extensively before enabling on a production environment.

For full control over the response compression, instantiate the API with `isBase64` set to true, and a custom serializer that returns a compressed response as a base64 encoded string. Also, don't forget to set the correct `content-encoding` header:

```javascript
const zlib = require('zlib');

const api = require('lambda-api')({
  isBase64: true,
  headers: {
    'content-encoding': ['gzip'],
  },
  serializer: (body) => {
    const json = JSON.stringify(body);
    return zlib.gzipSync(json).toString('base64');
  },
});
```

## Execution Stacks

Lambda API v0.10 introduced execution stacks as a way to more efficiently process middleware. Execution stacks are automatically created for you when adding routes and middleware using the standard route convenience methods, as well as `METHOD()` and `use()`. This is a technical implementation that has made method-based middleware and additional wildcard functionality possible.

Execution stacks are backwards compatible, so no code changes need to be made when upgrading from a lower version. The only caveat is with matching middleware to specific parameterized paths. Path-based middleware creates mount points that require methods to execute. This means that a `/users/:userId` middleware path would not execute if you defined a `/users/test` path.

Execution stacks allow you to execute multiple middlewares based on a number of factors including path and method. For example, you can specify a global middleware to run on every `/user/*` route, with additional middleware running on just `/user/settings/*` routes, with more middleware running on just `GET` requests to `/users/settings/name`. Execution stacks inherit middleware from matching routes and methods higher up the stack, building a final stack that is unique to each route. Definition order also matters, meaning that routes defined _before_ global middleware **will not** have it as part of its execution stack. The same is true of any wildcard-based route, giving you flexibility and control over when middleware is applied.

For debugging purposes, a new `REQUEST` property called `stack` has been added. If you name your middleware functions (either by assigning them to variables or using standard named functions), the `stack` property will return an array that lists the function names of the execution stack in processing order.

## Lambda Proxy Integration

Lambda Proxy Integration is an option in API Gateway that allows the details of an API request to be passed as the `event` parameter of a Lambda function. A typical API Gateway request event with Lambda Proxy Integration enabled can be found [here](https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request).

Lambda API automatically parses this information to create a normalized `REQUEST` object. The request can then be routed using the APIs methods.

## ALB Integration

AWS recently added support for Lambda functions as targets for Application Load Balancers. While the events from ALBs are similar to API Gateway, there are a number of differences that would require code changes based on implementation. Lambda API detects the event `interface` and automatically normalizes the `REQUEST` object. It also correctly formats the `RESPONSE` (supporting both multi-header and non-multi-header mode) for you. This allows you to call your Lambda function from API Gateway, ALB, or both, without requiring any code changes.

Please note that ALB events do not contain all of the same headers as API Gateway (such as `clientType`), but Lambda API provides defaults for seamless integration between the interfaces. ALB also automatically enables binary support, giving you the ability to serve images and other binary file types. Lambda API reads the `path` parameter supplied by the ALB event and uses that to route your requests. If you specify a wildcard in your listener rule, then all matching paths will be forwarded to your Lambda function. Lambda API's routing system can be used to process these routes just like with API Gateway. This includes static paths, parameterized paths, wildcards, middleware, etc.

Sample ALB request and response events can be found [here](https://docs.aws.amazon.com/lambda/latest/dg/services-alb.html).

## Configuring Routes in API Gateway

Routes must be configured in API Gateway in order to support routing to the Lambda function. The easiest way to support all of your routes without recreating them is to use [API Gateway's Proxy Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-proxy-resource?icmpid=docs_apigateway_console).

Simply create a `{proxy+}` route that uses the `ANY` method and all requests will be routed to your Lambda function and processed by the `lambda-api` module. In order for a "root" path mapping to work, you also need to create an `ANY` route for `/`.

## Reusing Persistent Connections

If you are using persistent connections in your function routes (such as AWS RDS or Elasticache), be sure to set `context.callbackWaitsForEmptyEventLoop = false;` in your main handler. This will allow the freezing of connections and will prevent Lambda from hanging on open connections. See [here](https://www.jeremydaly.com/reuse-database-connections-aws-lambda/) for more information.

## TypeScript Support

An `index.d.ts` declaration file has been included for use with your TypeScript projects (thanks @hassankhan). Please feel free to make suggestions and contributions to keep this up-to-date with future releases.

**TypeScript Example**

```typescript
// import AWS Lambda types
import { APIGatewayEvent, Context } from 'aws-lambda';
// import Lambda API default function
import createAPI from 'lambda-api';

// instantiate framework
const api = createAPI();

// Define a route
api.get('/status', async (req, res) => {
  return { status: 'ok' };
});

// Declare your Lambda handler
exports.run = async (event: APIGatewayEvent, context: Context) => {
  // Run the request
  return await api.run(event, context);
};
```

## Contributions

Contributions, ideas and bug reports are welcome and greatly appreciated. Please add [issues](https://github.com/jeremydaly/lambda-api/issues) for suggestions and bug reports or create a pull request.

## Are you using Lambda API?

If you're using Lambda API and finding it useful, hit me up on [Twitter](https://twitter.com/jeremy_daly) or email me at contact[at]jeremydaly.com. I'd love to hear your stories, ideas, and even your complaints!
