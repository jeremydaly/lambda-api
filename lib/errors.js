'use strict';

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

// Custom error types

class RouteError extends Error {
  constructor(message, path) {
    super(message);
    this.name = 'RouteError';
    this.path = path;
  }
}

class MethodError extends Error {
  constructor(message, method, path) {
    super(message);
    this.name = 'MethodError';
    this.method = method;
    this.path = path;
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

class ResponseError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ResponseError';
    this.code = code;
  }
}

class FileError extends Error {
  constructor(message, err) {
    super(message);
    this.name = 'FileError';
    for (let e in err) this[e] = err[e];
  }
}

// Export the response object
module.exports = {
  RouteError,
  MethodError,
  ConfigurationError,
  ResponseError,
  FileError,
};
