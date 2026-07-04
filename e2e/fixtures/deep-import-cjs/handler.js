'use strict';
const createAPI = require('lambda-api');
const utils = require('lambda-api/lib/utils');
const { readFileSync } = require('fs');
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) =>
  res.json({ escaped: utils.escapeHtml('<x>'), hasFn: typeof utils.escapeHtml === 'function' })
);
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
api.run(event, {}).then((r) => process.stdout.write(JSON.stringify(r)))
  .catch((e) => { process.stderr.write(String(e.stack || e)); process.exit(1); });
