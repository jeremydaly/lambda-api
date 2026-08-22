'use strict';

import createAPI from '../dist/esm/index.js';
import * as utils from '../dist/esm/lib/utils.js';
import prettyPrint from '../dist/esm/lib/prettyPrint.js';
import { ApiError } from '../dist/esm/lib/errors.js';
import * as s3 from '../dist/esm/lib/s3-service.js';

const event = {
  httpMethod: 'GET',
  path: '/compat',
  headers: {},
  multiValueHeaders: {},
};

async function main() {
  const createApi = createAPI({ version: 'v1.0' });
  createApi.get('/compat', (req, res) => {
    res.json({ ok: true, method: req.method });
  });

  const result = await createApi.run(event, {});

  if (typeof createAPI !== 'function') {
    throw new Error('Expected default export to be a function');
  }

  if (typeof utils.escapeHtml !== 'function') {
    throw new Error('Expected utils.escapeHtml to be a function');
  }

  if (typeof prettyPrint !== 'function') {
    throw new Error('Expected prettyPrint default export to be a function');
  }

  if (typeof ApiError !== 'function') {
    throw new Error('Expected ApiError export to be a function');
  }

  if (result.statusCode !== 200) {
    throw new Error(`Expected statusCode 200, received ${result.statusCode}`);
  }

  if (JSON.parse(result.body).ok !== true) {
    throw new Error('Expected successful ESM route response');
  }

  for (const name of ['setConfig', 'getObject', 'getSignedUrl']) {
    if (typeof s3[name] !== 'function') {
      throw new Error(`Expected s3-service to export ${name} as a function`);
    }
  }

  // The CJS artifact collapses to this object; under ESM it stays a plain named export.
  if (typeof s3.service !== 'object' || typeof s3.service.getObject !== 'function') {
    throw new Error('Expected s3-service to export the service object');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
