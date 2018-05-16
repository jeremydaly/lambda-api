'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

 const QS = require('querystring') // Require the querystring library
 const crypto = require('crypto') // Require Node.js crypto library

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



const encodeBody = body =>
  typeof body === 'object' ? JSON.stringify(body) : (body && typeof body !== 'string' ? body.toString() : (body ? body : ''))

module.exports.encodeBody = encodeBody



module.exports.parseBody = body => {
  try {
    return JSON.parse(body)
  } catch(e) {
    return body;
  }
}



// Parses auth values into known formats
const parseAuthValue = (type,value) => {
  switch (type) {
    case 'Basic':
      let creds = Buffer.from(value, 'base64').toString().split(':')
      return { type, value, username: creds[0], password: creds[1] ? creds[1] : null }
    case 'OAuth':
      let params = QS.parse(value.replace(/",\s*/g,'&').replace(/"/g,'').trim())
      return Object.assign({ type, value }, params)
    default:
      return { type, value }
  }
}

module.exports.parseAuth = authStr => {
  let auth = authStr && typeof authStr === 'string' ? authStr.split(' ') : []
  return auth.length > 1 && ['Bearer','Basic','Digest','OAuth'].includes(auth[0]) ?
    parseAuthValue(auth[0], auth.slice(1).join(' ').trim()) :
    { type: 'none', value: null }
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


// Parses routes into readable array
const extractRoutes = (routes,table=[]) => {
  for (let route in routes) {
    if (/^__[A-Z]+$/.test(route)) {
      table.push([route.replace(/^__/,''),routes[route].path])
    } else {
      extractRoutes(routes[route],table)
    }
  }
  return table
}

module.exports.extractRoutes = extractRoutes


// Generate an Etag for the supplied value
module.exports.generateEtag = data =>
  crypto.createHash('sha256').update(encodeBody(data)).digest("hex").substr(0,32)
