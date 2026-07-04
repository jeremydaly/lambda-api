'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

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

  describe('ESM build output', function () {
    it('passes Node ESM compatibility checks', function () {
      execFileSync(process.execPath, ['__tests__/esm-compat.mjs'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
      });
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
