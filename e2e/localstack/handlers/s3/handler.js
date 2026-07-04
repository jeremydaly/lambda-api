'use strict';
const createAPI = require('lambda-api');
// LocalStack injects AWS_ENDPOINT_URL into the function env; force path-style addressing so the
// bucket resolves against the LocalStack endpoint.
const api = createAPI({ version: 'v1', s3Config: { forcePathStyle: true } });
const BUCKET = process.env.E2E_BUCKET;
api.get('/s3link', async (req, res) => {
  const url = await res.getLink('s3://' + BUCKET + '/hello.txt');
  return { url };
});
api.get('/s3file', async (req, res) => {
  await res.sendFile('s3://' + BUCKET + '/hello.txt');
});
exports.handler = async (event, context) => api.run(event, context);
