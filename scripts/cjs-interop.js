'use strict';
/**
 * Appends the CommonJS interop footers to the compiled CJS artifact.
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 *
 * `src/` is pure ESM and is compiled twice by SWC — to `dist/cjs` and to `dist/esm`. The
 * historical CommonJS shape (`require('lambda-api')` is callable, `require('lambda-api/lib/*')`
 * returns the value itself) has to be restored on top of SWC's `exports.default` output, but it
 * MUST NOT live in `src/`: anything written there also lands in `dist/esm`, and bundlers that
 * inline the ESM artifact into a generated CommonJS wrapper (esbuild `--format=cjs`, AWS CDK
 * `NodejsFunction`, SST, Serverless Framework) would then execute that write against the
 * CONSUMER's `module`, wiping out their own exports — issue #346, which surfaced on Lambda as
 * `Runtime.HandlerNotFound: index.handler is undefined or not exported`.
 *
 * So the footers are injected here, into `dist/cjs` only. Each one is written out per file rather
 * than generated from a single template: `.default` is correct on the package root but would, for
 * example, make `mimemap['default']` resolve to the whole MIME map.
 */

const fs = require('fs');
const path = require('path');

const CJS_DIR = path.join(__dirname, '..', 'dist', 'cjs');
const MARKER = '/* CommonJS interop — injected by scripts/cjs-interop.js */';

// Modules with a single `export default`: `require()` returns that value directly.
const DEFAULT_FOOTER = 'module.exports = exports.default;\n';

const FOOTERS = {
  'index.js':
    'var _createAPI = exports.default;\n' +
    'module.exports = _createAPI;\n' +
    '// Preserve the `.default` self-reference the CommonJS build shipped before the dual-package\n' +
    "// refactor, so `require('lambda-api').default` keeps working for TypeScript consumers\n" +
    '// compiled to CommonJS with esModuleInterop:false (they emit `require(...).default(...)`).\n' +
    'module.exports.default = _createAPI;\n',
  'lib/mimemap.js': DEFAULT_FOOTER,
  'lib/prettyPrint.js': DEFAULT_FOOTER,
  'lib/request.js': DEFAULT_FOOTER,
  'lib/response.js': DEFAULT_FOOTER,
  'lib/statusCodes.js': DEFAULT_FOOTER,
  // s3-service has no default export. It must resolve to the single mutable `service` object so
  // response.js and the unit suites (sinon.stub) operate on the same properties — SWC's own
  // `_export()` emits non-configurable getters, which stubbing cannot replace. `__esModule` keeps
  // SWC's `_interop_require_wildcard` returning the object untouched.
  'lib/s3-service.js':
    "Object.defineProperty(exports.service, '__esModule', { value: true });\n" +
    'module.exports = exports.service;\n',
};

// Loaded back after patching so a toolchain change that breaks the contract fails the BUILD,
// not just the test suite (`npm test` and `prepublishOnly` both go through `npm run build`).
const CONTRACT = {
  'index.js': (m) => typeof m === 'function' && m.default === m,
  'lib/mimemap.js': (m) =>
    typeof m.json === 'string' && m.default === undefined,
  'lib/prettyPrint.js': (m) => typeof m === 'function',
  'lib/request.js': (m) => typeof m === 'function',
  'lib/response.js': (m) => typeof m === 'function',
  'lib/statusCodes.js': (m) =>
    typeof m[404] === 'string' && m.default === undefined,
  'lib/s3-service.js': (m) =>
    m.__esModule === true &&
    'client' in m &&
    ['getObject', 'getSignedUrl', 'setConfig'].every(function (name) {
      const descriptor = Object.getOwnPropertyDescriptor(m, name);
      return (
        typeof m[name] === 'function' &&
        descriptor.writable &&
        descriptor.configurable
      );
    }),
};

const fail = (message) => {
  console.error('cjs-interop: ' + message); // eslint-disable-line no-console
  process.exit(1);
};

Object.keys(FOOTERS).forEach((relative) => {
  const file = path.join(CJS_DIR, relative);

  if (!fs.existsSync(file)) {
    fail('expected ' + relative + ' in dist/cjs — did build:cjs run?');
  }

  const source = fs.readFileSync(file, 'utf8');

  if (source.indexOf(MARKER) !== -1) {
    fail(relative + ' is already patched — run `npm run clean` first');
  }

  fs.writeFileSync(
    file,
    source.replace(/\s*$/, '\n') + '\n' + MARKER + '\n' + FOOTERS[relative]
  );
});

Object.keys(CONTRACT).forEach((relative) => {
  const file = path.join(CJS_DIR, relative);
  let loaded;

  try {
    loaded = require(file);
  } catch (e) {
    fail('patched ' + relative + ' failed to load: ' + e.message);
  }

  if (!CONTRACT[relative](loaded)) {
    fail(relative + ' did not end up with the expected CommonJS shape');
  }
});
