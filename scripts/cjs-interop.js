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
 * The rule, applied to every `src/**\/*.js` in turn:
 *
 *   - a module whose only export is `default` collapses to that value
 *   - a module with named exports is left as SWC emitted it
 *   - a module with BOTH is ambiguous and fails the build (see EXCEPTIONS)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const CJS_DIR = path.join(ROOT, 'dist', 'cjs');
const MARKER = '/* CommonJS interop — injected by scripts/cjs-interop.js */';

// Any `export` line that is not `export default` is a named export. Stated as a negative
// lookahead rather than a list of keywords so forms nobody uses today — `export async function`,
// `export * from`, `export { x as default }` — classify correctly instead of slipping through.
const HAS_DEFAULT = /^export default\b|\bas default\b/m;
const HAS_NAMED = /^export (?!default\b)/m;

// Modules whose CommonJS shape is not "collapse to the default export". Anything listed here
// wins over the rule, so a module with both a default and named exports needs an entry.
const EXCEPTIONS = {
  'index.js':
    'var _createAPI = exports.default;\n' +
    'module.exports = _createAPI;\n' +
    '// Preserve the `.default` self-reference the CommonJS build shipped before the dual-package\n' +
    "// refactor, so `require('lambda-api').default` keeps working for TypeScript consumers\n" +
    '// compiled to CommonJS with esModuleInterop:false (they emit `require(...).default(...)`).\n' +
    'module.exports.default = _createAPI;\n',
  // No default export. It must resolve to the single mutable `service` object so response.js and
  // the unit suites (sinon.stub) operate on the same properties — SWC's own `_export()` emits
  // non-configurable getters, which stubbing cannot replace. `__esModule` keeps SWC's
  // `_interop_require_wildcard` returning the object untouched.
  [path.join('lib', 's3-service.js')]:
    "Object.defineProperty(exports.service, '__esModule', { value: true });\n" +
    'module.exports = exports.service;\n',
};

const COLLAPSE_TO_DEFAULT = 'module.exports = exports.default;\n';

const fail = (message) => {
  console.error('cjs-interop: ' + message); // eslint-disable-line no-console
  process.exit(1);
};

const jsFilesIn = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((acc, entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return acc.concat(jsFilesIn(full));
    return entry.name.endsWith('.js') ? acc.concat(full) : acc;
  }, []);

jsFilesIn(SRC_DIR).forEach((sourceFile) => {
  const relative = path.relative(SRC_DIR, sourceFile);
  const source = fs.readFileSync(sourceFile, 'utf8');

  let footer = EXCEPTIONS[relative];

  if (!footer) {
    if (!HAS_DEFAULT.test(source)) return; // named exports only — SWC's output is already right
    if (HAS_NAMED.test(source)) {
      fail(
        'src/' +
          relative +
          ' mixes a default export with named exports, so collapsing it to the default would ' +
          'silently drop the rest — add an explicit entry to EXCEPTIONS in this file. ' +
          '(`export { x as default }` counts; prefer `export default x`.)'
      );
    }
    footer = COLLAPSE_TO_DEFAULT;
  }

  const target = path.join(CJS_DIR, relative);

  if (!fs.existsSync(target)) {
    fail('expected ' + relative + ' in dist/cjs — did build:cjs run?');
  }

  fs.writeFileSync(
    target,
    fs.readFileSync(target, 'utf8').trimEnd() + '\n\n' + MARKER + '\n' + footer
  );
});
