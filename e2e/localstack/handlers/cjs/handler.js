'use strict';
const createAPI = require('lambda-api');
const api = createAPI({ version: 'v1' });
api.get('/', (req, res) => res.json({ hello: 'world', lang: 'cjs' }));
api.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
exports.handler = async (event, context) => api.run(event, context);
