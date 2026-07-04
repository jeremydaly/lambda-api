'use strict';
// An S3 route in a project WITHOUT the optional @aws-sdk installed must fail GRACEFULLY
// (handled 5xx), never crash the process with an unhandled rejection. Node's default
// (unhandled rejections terminate the process) means a leak here exits non-zero -> the
// runner sees a non-zero status and fails. The 50ms settle lets any stray rejection surface.
const createAPI = require('lambda-api');
const { readFileSync } = require('fs');
const api = createAPI({ version: 'v1' });
api.get('/ok', (req, res) => res.json({ ok: true }));
api.get('/link', async (req, res) => {
  const url = await res.getLink('s3://bucket/key.txt');
  return { url };
});
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
api
  .run(event, {})
  .then((r) => setTimeout(() => process.stdout.write(JSON.stringify(r)), 50))
  .catch((e) => { process.stderr.write(String(e.stack || e)); process.exit(1); });
