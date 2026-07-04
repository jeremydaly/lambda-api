import createAPI from 'lambda-api';
import { readFileSync } from 'node:fs';
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) => res.json({ hello: 'world', lang: 'esm' }));
api.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
api.post('/users', (req, res) => res.json({ created: req.body }));
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const r = await api.run(event, { getRemainingTimeInMillis: () => 3000 });
process.stdout.write(JSON.stringify(r));
