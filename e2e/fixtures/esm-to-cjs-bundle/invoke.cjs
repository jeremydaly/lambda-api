'use strict';
// Loads the esbuild CJS bundle exactly the way the AWS Lambda Node runtime does — a plain
// `require()` followed by a lookup of the named export — and reports what actually survived.
const { readFileSync } = require('fs');

const bundle = require('./bundle.cjs');
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));

const out = {
  keys: Object.keys(bundle),
  handlerType: typeof bundle.handler,
  response: null,
};

Promise.resolve()
  .then(() =>
    out.handlerType === 'function'
      ? bundle.handler(event, { getRemainingTimeInMillis: () => 3000 })
      : null
  )
  .then((response) => {
    out.response = response;
    process.stdout.write(JSON.stringify(out));
  })
  .catch((e) => {
    process.stderr.write(String((e && e.stack) || e));
    process.exit(1);
  });
