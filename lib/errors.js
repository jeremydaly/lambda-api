'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

// Custom error types

class RouteError extends Error {
  constructor(message,path) {
    super(message)
    this.name = this.constructor.name
    this.path = path
  }
}

class MethodError extends Error {
  constructor(message,method,path) {
    super(message)
    this.name = this.constructor.name
    this.method = method
    this.path = path
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

class ResponseError extends Error {
  constructor(message,code) {
    super(message)
    this.name = this.constructor.name
    this.code = code
  }
}

class FileError extends Error {
  constructor(message,err) {
    super(message)
    this.name = this.constructor.name
    for (let e in err) this[e] = err[e]
  }
}

// Export the response object
module.exports = {
  RouteError,
  MethodError,
  ConfigurationError,
  ResponseError,
  FileError
}
