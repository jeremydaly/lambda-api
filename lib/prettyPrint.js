'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

module.exports = routes => {
  // Calculate column widths
  let widths = routes.reduce((acc,row) => {
    return [Math.max(acc[0],row[0].length),Math.max(acc[1],row[1].length)]
  },[0,0])

  console.log('╔══' + ''.padEnd(widths[0],'═') + '══╤══' + ''.padEnd(widths[1],'═') + '══╗')
  console.log('║  ' + "\u001b[1m" + 'METHOD'.padEnd(widths[0]) + "\u001b[0m" + '  │  ' + "\u001b[1m" + 'ROUTE'.padEnd(widths[1]) + "\u001b[0m" + '  ║')
  console.log('╟──' + ''.padEnd(widths[0],'─') + '──┼──' + ''.padEnd(widths[1],'─') + '──╢')
  routes.forEach((route,i) => {
    console.log('║  ' + route[0].padEnd(widths[0]) + '  │  ' + route[1].padEnd(widths[1]) + '  ║')
    if (i < routes.length-1) { console.log('╟──' + ''.padEnd(widths[0],'─') + '──┼──' + ''.padEnd(widths[1],'─') + '──╢') }
  })
  console.log('╚══' + ''.padEnd(widths[0],'═') + '══╧══' + ''.padEnd(widths[1],'═') + '══╝')
}
