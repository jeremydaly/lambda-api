'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
*/

const zlib = require('zlib')

exports.compress = (input,headers) => {
  const acceptEncodingHeader = headers['accept-encoding'] || ''
  const acceptableEncodings = new Set(acceptEncodingHeader.split(',').map(str => str.trim()))
  
  // Handle Brotli compression
  if (acceptableEncodings.has('br')) {
    return {
      data: zlib.brotliCompressSync(input),
      contentEncoding: 'br'
    }
  }

  // Handle Gzip compression
  if (acceptableEncodings.has('gzip')) {
    return {
      data: zlib.gzipSync(input),
      contentEncoding: 'gzip'
    }
  }

  // Handle deflate compression
  if (acceptableEncodings.has('deflate')) {
    return {
      data: zlib.deflateSync(input),
      contentEncoding: 'deflate'
    }
  }

  return {
    data: input,
    contentEncoding: null
  }
}