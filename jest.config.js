'use strict';

module.exports = {
  moduleNameMapper: {
    '^\\.\\./index$': '<rootDir>/dist/cjs/index.js',
    '^\\.\\./lib/(.*)$': '<rootDir>/dist/cjs/lib/$1.js',
  },
  testMatch: ['**/__tests__/**/*.unit.js'],
};
