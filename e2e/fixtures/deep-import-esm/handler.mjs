import createAPI from 'lambda-api';
import * as utils from 'lambda-api/lib/utils.js';
import { readFileSync } from 'node:fs';
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) =>
  res.json({ escaped: utils.escapeHtml('<x>'), hasFn: typeof utils.escapeHtml === 'function' })
);
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const r = await api.run(event, {});
process.stdout.write(JSON.stringify(r));
