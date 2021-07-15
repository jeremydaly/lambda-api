'use strict';

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

const zlib = require('zlib');

const defaultEnabledEcodings = ['gzip', 'deflate'];

exports.compress = (input, headers, _enabledEncodings) => {
  const enabledEncodings = new Set(_enabledEncodings || defaultEnabledEcodings);
  const acceptEncodingHeader = headers['accept-encoding'] || '';
  const acceptableEncodings = new Set(
    acceptEncodingHeader
      .toLowerCase()
      .split(',')
      .map((str) => str.trim())
  );

  // Handle Brotli compression (Only supported in Node v10 and later)
  if (
    acceptableEncodings.has('br') &&
    enabledEncodings.has('br') &&
    typeof zlib.brotliCompressSync === 'function'
  ) {
    return {
      data: zlib.brotliCompressSync(input),
      contentEncoding: 'br',
    };
  }

  // Handle Gzip compression
  if (acceptableEncodings.has('gzip') && enabledEncodings.has('gzip')) {
    return {
      data: zlib.gzipSync(input),
      contentEncoding: 'gzip',
    };
  }

  // Handle deflate compression
  if (acceptableEncodings.has('deflate') && enabledEncodings.has('deflate')) {
    return {
      data: zlib.deflateSync(input),
      contentEncoding: 'deflate',
    };
  }

  return {
    data: input,
    contentEncoding: null,
  };
};
