'use strict'

const AWS = require('aws-sdk') // AWS SDK
const Promise = require('bluebird') // Promise library

// Export
module.exports = Promise.promisifyAll(new AWS.S3())
