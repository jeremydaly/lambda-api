'use strict';

const fs = require('fs');
const path = require('path');

const {
  footerFor,
  COLLAPSE_TO_DEFAULT,
  EXCEPTIONS,
} = require('../scripts/cjs-interop.js');

const SRC = path.join(__dirname, '..', 'src');

// The build step decides each module's CommonJS shape from its ESM source. Getting that
// classification wrong is silent in the worst direction — a module that mixes a default with
// named exports would collapse to the default and DROP the rest — so every export form is
// pinned here rather than only the ones src/ happens to use today.
describe('cjs-interop footer classification:', function () {
  describe('collapses to the default export', function () {
    const cases = {
      'export default': 'const t = () => 1;\nexport default t;\n',
      'export default class': 'export default class T {}\n',
      'export default function': 'export default function t() {}\n',
      'export default object': 'export default { a: 1 };\n',
    };

    Object.keys(cases).forEach((name) => {
      it(name, function () {
        expect(footerFor('lib/probe.js', cases[name])).toBe(
          COLLAPSE_TO_DEFAULT
        );
      });
    });
  });

  describe('leaves SWC output alone', function () {
    const cases = {
      'export const': 'export const a = 1;\n',
      'export async function': 'export async function a() {}\n',
      'export list': 'const a = 1;\nexport { a };\n',
      'export star': "export * from './x.js';\n",
      'no exports at all': 'const a = 1;\n',
    };

    Object.keys(cases).forEach((name) => {
      it(name, function () {
        expect(footerFor('lib/probe.js', cases[name])).toBeNull();
      });
    });
  });

  describe('refuses ambiguous shapes rather than dropping exports', function () {
    const cases = {
      'default + const': 'export const a = 1;\nexport default a;\n',
      'default + async function':
        'export async function a() {}\nconst t = 1;\nexport default t;\n',
      'default + star': "export * from './x.js';\nexport default 1;\n",
      'default + named list':
        'const a = 1;\nconst t = 2;\nexport { a };\nexport default t;\n',
      'export { x as default }': 'const t = 1;\nexport { t as default };\n',
    };

    Object.keys(cases).forEach((name) => {
      it(name, function () {
        expect(() => footerFor('lib/probe.js', cases[name])).toThrow(
          /ambiguous|silently drop/
        );
      });
    });
  });

  describe('exceptions win over the rule', function () {
    Object.keys(EXCEPTIONS).forEach((relative) => {
      it(`${relative} uses its explicit footer`, function () {
        // Passing source that the rule would classify differently proves the override applies.
        expect(footerFor(relative, 'export const a = 1;\n')).toBe(
          EXCEPTIONS[relative]
        );
      });
    });

    it('every exception names a file that still exists in src/', function () {
      Object.keys(EXCEPTIONS).forEach((relative) => {
        expect(fs.existsSync(path.join(SRC, relative))).toBe(true);
      });
    });
  });
});
