'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

const QS = require('querystring') // Require the querystring library
const crypto = require('crypto') // Require Node.js crypto library
const { FileError } = require('./errors') // Require custom errors

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}

exports.escapeHtml = html => html.replace(/[&<>"']/g, s => entityMap[s])


// From encodeurl by Douglas Christopher Wilson
let ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g
let UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g
let UNMATCHED_SURROGATE_PAIR_REPLACE = '$1\uFFFD$2'

exports.encodeUrl = url => String(url)
  .replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE)
  .replace(ENCODE_CHARS_REGEXP, encodeURI)



const encodeBody = (body,serializer) => {
  const encode = typeof serializer === 'function' ? serializer : JSON.stringify
  return typeof body === 'object' ? encode(body) : (body && typeof body !== 'string' ? body.toString() : (body ? body : ''))
}

exports.encodeBody = encodeBody

exports.parsePath = path => {
  return path ? path.trim().split('?')[0].replace(/^\/(.*?)(\/)*$/,'$1').split('/') : []
}


exports.parseBody = body => {
  try {
    return JSON.parse(body)
  } catch(e) {
    return body
  }
}



// Parses auth values into known formats
const parseAuthValue = (type,value) => {
  switch (type) {
    case 'Basic': {
      let creds = Buffer.from(value, 'base64').toString().split(':')
      return { type, value, username: creds[0], password: creds[1] ? creds[1] : null }
    }
    case 'OAuth': {
      let params = QS.parse(value.replace(/",\s*/g,'&').replace(/"/g,'').trim())
      return Object.assign({ type, value }, params)
    }
    default: {
      return { type, value }
    }
  }
}

exports.parseAuth = authStr => {
  let auth = authStr && typeof authStr === 'string' ? authStr.split(' ') : []
  return auth.length > 1 && ['Bearer','Basic','Digest','OAuth'].includes(auth[0]) ?
    parseAuthValue(auth[0], auth.slice(1).join(' ').trim()) :
    { type: 'none', value: null }
}



const mimeMap = require('./mimemap.js') // MIME Map

exports.mimeLookup = (input,custom={}) => {
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

const statusCodes = require('./statusCodes.js') // MIME Map

exports.statusLookup = status => {
  return status in statusCodes ? statusCodes[status] : 'Unknown'
}


// Parses routes into readable array
const extractRoutes = (routes,table=[]) => {
  // Loop through all routes
  for (let route in routes['ROUTES']) {
    // Add methods
    for (let method in routes['ROUTES'][route]['METHODS']) {
      table.push([method,routes['ROUTES'][route]['METHODS'][method].path])
    }
    extractRoutes(routes['ROUTES'][route],table)
  }
  return table
}

exports.extractRoutes = extractRoutes


// Generate an Etag for the supplied value
exports.generateEtag = data =>
  crypto.createHash('sha256').update(encodeBody(data)).digest('hex').substr(0,32)


// Check if valid S3 path
exports.isS3 = path => /^s3:\/\/.+\/.+/i.test(path)


// Parse S3 path
exports.parseS3 = path => {
  if (!this.isS3(path)) throw new FileError('Invalid S3 path',{path})
  let s3object = path.replace(/^s3:\/\//i,'').split('/')
  return { Bucket: s3object.shift(), Key: s3object.join('/') }
}


// Deep Merge
exports.deepMerge = (a,b) => {
  Object.keys(b).forEach(key => (key in a) ?
    this.deepMerge(a[key],b[key]) : Object.assign(a,b) )
  return a
}

exports.mergeObjects = (obj1,obj2) =>
  Object.keys(Object.assign({},obj1,obj2)).reduce((acc,key) => {
    if (obj1[key] && obj2[key] && obj1[key].every(e => obj2[key].includes(e))) {
      return Object.assign(acc,{ [key]: obj1[key] })
    } else {
      return Object.assign(acc,{
        [key]: obj1[key] ? obj2[key] ? obj1[key].concat(obj2[key]) : obj1[key] : obj2[key]
      })
    }
  },{})

// Concats values from an array to ',' separated string
exports.fromArray = val =>
  val && val instanceof Array ? val.toString() : undefined

// Stringify multi-value headers
exports.stringifyHeaders = headers =>
  Object.keys(headers)
    .reduce((acc,key) =>
      Object.assign(acc,{
        // set-cookie cannot be concatenated with a comma
        [key]: key === 'set-cookie' ? headers[key].slice(-1)[0] : headers[key].toString()
      })
      ,{})
