'use strict';
/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

// Require AWS SDK
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3'); // AWS SDK
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Export
exports.client = new S3Client();

exports.getObject = (params) => {
  const cmd = new GetObjectCommand(params);
  const promise = this.client.send(cmd);
  return {
    promise: () => promise,
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
