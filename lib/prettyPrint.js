'use strict';
/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

module.exports = (routes) => {
  let out = '';

  // Calculate column widths
  let widths = routes.reduce(
    (acc, row) => {
      return [
        Math.max(acc[0], Math.max(6, row[0].length)),
        Math.max(acc[1], Math.max(5, row[1].length)),
        Math.max(acc[2], Math.max(6, row[2].join(', ').length)),
      ];
    },
    [0, 0, 0]
  );

  out +=
    '╔══' +
    ''.padEnd(widths[0], '═') +
    '══╤══' +
    ''.padEnd(widths[1], '═') +
    '══╤══' +
    ''.padEnd(widths[2], '═') +
    '══╗\n';
  out +=
    '║  ' +
    '\u001b[1m' +
    'METHOD'.padEnd(widths[0]) +
    '\u001b[0m' +
    '  │  ' +
    '\u001b[1m' +
    'ROUTE'.padEnd(widths[1]) +
    '\u001b[0m' +
    '  │  ' +
    '\u001b[1m' +
    'STACK'.padEnd(widths[2]) +
    '\u001b[0m' +
    '  ║\n';
  out +=
    '╟──' +
    ''.padEnd(widths[0], '─') +
    '──┼──' +
    ''.padEnd(widths[1], '─') +
    '──┼──' +
    ''.padEnd(widths[2], '─') +
    '──╢\n';
  routes.forEach((route, i) => {
    out +=
      '║  ' +
      route[0].padEnd(widths[0]) +
      '  │  ' +
      route[1].padEnd(widths[1]) +
      '  │  ' +
      route[2].join(', ').padEnd(widths[2]) +
      '  ║\n';
    if (i < routes.length - 1) {
      out +=
        '╟──' +
        ''.padEnd(widths[0], '─') +
        '──┼──' +
        ''.padEnd(widths[1], '─') +
        '──┼──' +
        ''.padEnd(widths[2], '─') +
        '──╢\n';
    } // end if
  });
  out +=
    '╚══' +
    ''.padEnd(widths[0], '═') +
    '══╧══' +
    ''.padEnd(widths[1], '═') +
    '══╧══' +
    ''.padEnd(widths[2], '═') +
    '══╝';

  return out;
};
