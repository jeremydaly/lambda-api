'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

// Require AWS SDK
const AWS = require('aws-sdk') // AWS SDK

// Export
module.exports = new AWS.S3()
