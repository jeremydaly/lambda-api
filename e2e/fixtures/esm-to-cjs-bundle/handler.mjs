// Issue #346: an ESM handler bundled to a single CommonJS file — the shape produced by
// AWS CDK `NodejsFunction`, SST and Serverless Framework. esbuild resolves lambda-api through
// the `import` condition and inlines dist/esm into a generated CJS wrapper.
import createAPI from 'lambda-api';

const api = createAPI({ version: 'v1' });
api.get('/', (req, res) => res.json({ hello: 'world', lang: 'esm-to-cjs' }));

export const handler = async (event, context) => api.run(event, context);
