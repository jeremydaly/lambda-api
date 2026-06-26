'use strict';
/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

// Require AWS SDK
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3'); // AWS SDK
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const MAX_BUFFERED_OBJECT_SIZE = parseInt(
  process.env.AWS_S3_MAX_BUFFERED_OBJECT_SIZE ||
    process.env.AWS_S3_MAX_OBJECT_SIZE ||
    10485760,
  10
);

const streamToBufferWithLimit = async (stream, maxSize) => {
  const chunks = [];
  let size = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;

    if (size > maxSize) {
      if (typeof stream.destroy === 'function') stream.destroy();
      throw new Error('S3 object exceeds maximum allowed buffered size');
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
};

// Export
exports.client = new S3Client();
exports.setConfig = (config) => (exports.client = new S3Client(config));

exports.getObject = (params) => {
  return {
    promise: async () => {
      const res = await this.client.send(new GetObjectCommand(params));

      if (!res.Body) return res;

      if (
        Number.isFinite(MAX_BUFFERED_OBJECT_SIZE) &&
        MAX_BUFFERED_OBJECT_SIZE > 0 &&
        typeof res.ContentLength === 'number' &&
        res.ContentLength > MAX_BUFFERED_OBJECT_SIZE
      ) {
        throw new Error('S3 object exceeds maximum allowed buffered size');
      }

      return {
        ...res,
        Body: await streamToBufferWithLimit(res.Body, MAX_BUFFERED_OBJECT_SIZE),
      };
    },
  };
};

exports.getSignedUrl = async (
  type,
  { Expires, ...params },
  callback = () => {}
) => {
  let command;
  switch (type) {
    case 'getObject':
      command = new GetObjectCommand(params);
      break;
    default:
      throw new Error('Invalid command type');
  }
  return getSignedUrl(this.client, command, { expiresIn: Expires })
    .then((url) => {
      callback(null, url);
      return url;
    })
    .catch((err) => {
      callback(err);
    });
};
