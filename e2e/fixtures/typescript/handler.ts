import createAPI from 'lambda-api';
import { readFileSync } from 'node:fs';
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) => res.json({ hello: 'world', lang: 'ts' }));
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
api.run(event, {} as any).then((r: any) => process.stdout.write(JSON.stringify(r)));
