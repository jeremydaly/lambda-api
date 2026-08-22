'use strict';
/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

import { streamToBuffer } from './utils.js';

// The AWS SDK is an OPTIONAL peer dependency. It (and the S3 client) are loaded lazily on the
// first real S3 use so that `require('lambda-api')` / `import 'lambda-api'` never pull it in for
// consumers that don't use S3. `dynamicImport` is enabled in both SWC configs, so `import()`
// compiles to a lazy `require()` in the CJS build and stays a native dynamic `import()` in ESM.
let _config;
let _client;

export const setConfig = (config) => {
  _config = config;
  _client = undefined; // rebuild with the new config on next use
};

const getClient = async () => {
  if (!_client) {
    const { S3Client } = await import('@aws-sdk/client-s3');
    _client = new S3Client(_config);
  }
  return _client;
};

export const getObject = (params) => {
  return {
    promise: async () => {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const client = await getClient();
      const res = await client.send(new GetObjectCommand(params));

      if (!res.Body) return res;

      return {
        ...res,
        Body: await streamToBuffer(res.Body),
      };
    },
  };
};

export const getSignedUrl = async (
  type,
  { Expires, ...params },
  callback = () => {}
) => {
  // Callers (response.getLink) use the callback and ignore the returned promise, so this must
  // ALWAYS resolve via the callback and never reject — including when the lazy SDK import fails.
  try {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl: awsGetSignedUrl } = await import(
      '@aws-sdk/s3-request-presigner'
    );
    let command;
    switch (type) {
      case 'getObject':
        command = new GetObjectCommand(params);
        break;
      default:
        throw new Error('Invalid command type');
    }
    const client = await getClient();
    const url = await awsGetSignedUrl(client, command, { expiresIn: Expires });
    callback(null, url);
    return url;
  } catch (err) {
    callback(err);
  }
};

// @internal — not part of the public API.
// The CommonJS artifact re-exports this object as its whole module value (see
// scripts/cjs-interop.js) so `require('lambda-api/lib/s3-service')` keeps returning ONE mutable
// service object: response.js reads the S3 methods through it and the unit suites stub them on
// it. It is exported here only so the build step can reach it — the `client` getter closes over
// the module-local client, so the footer cannot rebuild the object itself.
export const service = {
  get client() {
    return _client;
  },
  setConfig,
  getObject,
  getSignedUrl,
};
