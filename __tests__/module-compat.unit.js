'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

const event = {
  httpMethod: 'GET',
  path: '/compat',
  headers: {},
  multiValueHeaders: {},
};

const runRoute = async (api) => {
  api.get('/compat', (req, res) => {
    res.json({ ok: true, method: req.method });
  });

  return api.run(event, {});
};

// Recursively collect every compiled .js file under a dist directory.
const jsFilesIn = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((acc, entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return acc.concat(jsFilesIn(full));
    return entry.name.endsWith('.js') ? acc.concat(full) : acc;
  }, []);

describe('Module Compatibility Tests:', function () {
  describe('CommonJS build output', function () {
    it('loads the package factory from dist/cjs', function () {
      const createAPI = require('../dist/cjs/index.js');
      expect(typeof createAPI).toBe('function');
    });

    it('exposes a .default self-reference (require("lambda-api").default)', function () {
      // Preserves the pre-dual-package behavior so TS consumers compiled to CommonJS with
      // esModuleInterop:false (they emit `require('lambda-api').default(...)`) keep working.
      const createAPI = require('../dist/cjs/index.js');
      expect(createAPI.default).toBe(createAPI);
    });

    it('runs a route from dist/cjs', async function () {
      const createAPI = require('../dist/cjs/index.js');
      const api = createAPI({ version: 'v1.0' });
      const result = await runRoute(api);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ ok: true, method: 'GET' });
    });

    it('loads deep lib subpaths from dist/cjs', function () {
      const utils = require('../dist/cjs/lib/utils.js');
      const errors = require('../dist/cjs/lib/errors.js');
      const prettyPrint = require('../dist/cjs/lib/prettyPrint.js');

      expect(typeof utils.escapeHtml).toBe('function');
      expect(typeof errors.ApiError).toBe('function');
      expect(typeof prettyPrint).toBe('function');
    });
  });

  // The CommonJS interop shape below is what `scripts/cjs-interop.js` appends to dist/cjs. It is
  // pinned here because the source is pure ESM: nothing in src/ produces this shape any more.
  describe('CommonJS interop shape (dist/cjs only)', function () {
    it('exports the default value itself for single-default modules', function () {
      expect(typeof require('../dist/cjs/lib/request.js')).toBe('function');
      expect(typeof require('../dist/cjs/lib/response.js')).toBe('function');
      expect(typeof require('../dist/cjs/lib/prettyPrint.js')).toBe('function');
      expect(typeof require('../dist/cjs/lib/statusCodes.js')[404]).toBe(
        'string'
      );
      expect(typeof require('../dist/cjs/lib/mimemap.js').json).toBe('string');
    });

    it('does not graft a .default self-reference onto the lib modules', function () {
      // `.default` is only correct on the package root. On mimemap in particular it would make
      // a `default` file extension resolve to the whole map.
      expect(require('../dist/cjs/lib/mimemap.js').default).toBeUndefined();
      expect(require('../dist/cjs/lib/statusCodes.js').default).toBeUndefined();
    });

    it('exposes s3-service as a single mutable object that sinon can stub', function () {
      // response.js reads S3 methods through this same object, and four unit suites do
      // `sinon.stub(require('../lib/s3-service'), 'getSignedUrl')`. SWC's own `_export()` emits
      // non-configurable getters, which would make stubbing throw.
      const s3 = require('../dist/cjs/lib/s3-service.js');

      expect(s3.__esModule).toBe(true);
      expect('client' in s3).toBe(true);

      ['getObject', 'getSignedUrl', 'setConfig'].forEach((method) => {
        const descriptor = Object.getOwnPropertyDescriptor(s3, method);
        expect(typeof s3[method]).toBe('function');
        expect(descriptor.writable).toBe(true);
        expect(descriptor.configurable).toBe(true);
      });
    });
  });

  describe('ESM build output', function () {
    it('passes Node ESM compatibility checks', function () {
      execFileSync(process.execPath, ['__tests__/esm-compat.mjs'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
      });
    });

    // Regression guard for issue #346. Bundlers that inline the ESM artifact into a generated
    // CommonJS wrapper (esbuild --format=cjs, CDK NodejsFunction, SST, Serverless) leave exactly
    // one `module` in scope: the CONSUMER's. Any write to it from here silently replaces the
    // consumer's exports, which on Lambda surfaces as `Runtime.HandlerNotFound`.
    it('never touches the CommonJS module system (issue #346)', function () {
      const esm = path.join(DIST, 'esm');
      const patterns = [
        /\bmodule\s*\.\s*exports\b/,
        /\btypeof\s+module\b/,
        /(?:^|[^.\w$])exports\s*(?:\.|\[)/,
      ];

      const offenders = jsFilesIn(esm)
        .filter((file) => {
          const source = fs.readFileSync(file, 'utf8');
          return patterns.some((pattern) => pattern.test(source));
        })
        .map((file) => path.relative(esm, file));

      expect(offenders).toEqual([]);
    });
  });

  describe('Package exports resolution', function () {
    it('resolves the package root and lib subpaths', function () {
      execFileSync(
        process.execPath,
        [
          '-e',
          "const { createRequire } = require('module');" +
            "const packageRequire = createRequire(require('path').resolve('package.json'));" +
            "const createAPI = packageRequire('.');" +
            "const utils = packageRequire('lambda-api/lib/utils');" +
            "const utilsWithExtension = packageRequire('lambda-api/lib/utils.js');" +
            "if (typeof createAPI !== 'function') throw new Error('Expected package root export to be a function');" +
            "if (typeof utils.escapeHtml !== 'function') throw new Error('Expected lib/utils export to expose escapeHtml');" +
            "if (typeof utilsWithExtension.escapeHtml !== 'function') throw new Error('Expected lib/utils.js export to expose escapeHtml');",
        ],
        {
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
        }
      );
    });
  });
});
