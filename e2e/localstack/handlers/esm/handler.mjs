import createAPI from 'lambda-api';
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) => res.json({ hello: 'world', lang: 'esm' }));
api.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
export const handler = async (event, context) => api.run(event, context);
