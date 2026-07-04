'use strict';
const createAPI = require('lambda-api');
const { readFileSync } = require('fs');
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) => res.json({ hello: 'world', lang: 'cjs' }));
api.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
api.post('/users', (req, res) => res.json({ created: req.body }));
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
api
  .run(event, { getRemainingTimeInMillis: () => 3000 })
  .then((r) => process.stdout.write(JSON.stringify(r)))
  .catch((e) => { process.stderr.write('HANDLER_ERROR:' + (e && e.stack || e)); process.exit(1); });
