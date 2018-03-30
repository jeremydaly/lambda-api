'use strict'

/**
 * Lightweight Node.js API for AWS Lambda
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

 const entityMap = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
   '"': '&quot;',
   "'": '&#39;'
 }

module.exports.escapeHtml = html => html.replace(/[&<>"']/g, s => entityMap[s])


// From encodeurl by Douglas Christopher Wilson
let ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g
let UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g
let UNMATCHED_SURROGATE_PAIR_REPLACE = '$1\uFFFD$2'

module.exports.encodeUrl = url => String(url)
  .replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE)
  .replace(ENCODE_CHARS_REGEXP, encodeURI)



module.exports.encodeBody = body =>
  typeof body === 'object' ? JSON.stringify(body) : (body && typeof body !== 'string' ? body.toString() : (body ? body : ''))



module.exports.parseBody = body => {
  try {
    return JSON.parse(body)
  } catch(e) {
    return body;
  }
}



const mimeMap = require('./mimemap.js') // MIME Map

module.exports.mimeLookup = (input,custom={}) => {
  let type = input.trim().replace(/^\./,'')

  // If it contains a slash, return unmodified
  if (/.*\/.*/.test(type)) {
    return input.trim()
  } else {
    // Lookup mime type
    let mime = Object.assign(mimeMap,custom)[type]
    return mime ? mime : false
  }
}
