'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

const escapeHtml = require('./utils.js').escapeHtml
const encodeUrl = require('./utils.js').encodeUrl
const encodeBody = require('./utils.js').encodeBody
const mimeLookup = require('./utils.js').mimeLookup

const fs = require('fs') // Require Node.js file system
const path = require('path') // Require Node.js path

class RESPONSE {

  // Create the constructor function.
  constructor(app) {

    // Create a reference to the app
    this.app = app

    // Default statusCode to 200
    this._statusCode = 200

    // Default the header
    this._headers = {
      // Set the Content-Type by default
      "Content-Type": "application/json" //charset=UTF-8
    }

    // base64 encoding flag
    this._isBase64 = false

    // Default callback function
    this._callback = 'callback'
  }

  // Sets the statusCode
  status(code) {
    this._statusCode = code
    return this
  }

  // Adds a header field
  header(field,value) {
    this._headers[field] = value
    return this
  }

  // Convenience method for JSON
  json(body) {
    this.header('Content-Type','application/json').send(JSON.stringify(body))
  }

  // Convenience method for JSONP
  jsonp(body) {
    // Check the querystring for callback or cb
    let query = this.app._event.queryStringParameters || {}
    let cb = query[this.app._callbackName]

    this.header('Content-Type','application/json')
      .send((cb ? cb.replace(' ','_') : 'callback') + '(' + JSON.stringify(body) + ')')
  }

  // Convenience method for HTML
  html(body) {
    this.header('Content-Type','text/html').send(body)
  }

  // Convenience method for setting Location header
  location(path) {
    this.header('Location',encodeUrl(path))
    return this
  }

  // Convenience method for Redirect
  redirect(path) {
    let statusCode = 302 // default

    // If status code is provided
    if (arguments.length === 2) {
      if ([300,301,302,303,307,308].includes(arguments[0])) {
        statusCode = arguments[0]
        path = arguments[1]
      } else {
        throw new Error(arguments[0] + ' is an invalid redirect status code')
      }
    }

    let url = escapeHtml(path)

    this.location(path)
      .status(statusCode)
      .html(`<p>${statusCode} Redirecting to <a href="${url}">${url}</a></p>`)
  } // end redirect


  // Convenience method for setting cookies
  // see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
  cookie(name,value,opts={}) {

    // Set the name and value of the cookie
    let cookieString = (typeof name !== 'String' ? name.toString() : name)
      + '=' + encodeURIComponent(encodeBody(value))

    // domain (String): Domain name for the cookie
    cookieString += opts.domain ? '; Domain=' + opts.domain : ''

    // expires (Date): Expiry date of the cookie, convert to GMT
    cookieString += opts.expires && typeof opts.expires.toUTCString === 'function' ?
      '; Expires=' + opts.expires.toUTCString() : ''

    // httpOnly (Boolean): Flags the cookie to be accessible only by the web server
    cookieString += opts.httpOnly && opts.httpOnly === true ? '; HttpOnly' : ''

    // maxAge (Number) Set expiry time relative to the current time in milliseconds
    cookieString += opts.maxAge && !isNaN(opts.maxAge) ?
      '; MaxAge=' + (opts.maxAge/1000|0)
        + (!opts.expires ? '; Expires=' + new Date(Date.now() + opts.maxAge).toUTCString() : '')
      : ''

    // path (String): Path for the cookie
    cookieString += opts.path ? '; Path=' + opts.path : '; Path=/'

    // secure (Boolean): Marks the cookie to be used with HTTPS only
    cookieString += opts.secure && opts.secure === true ? '; Secure' : ''

    // sameSite (Boolean or String) Value of the “SameSite” Set-Cookie attribute
    // see https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1.
    cookieString += opts.sameSite !== undefined ? '; SameSite='
      + (opts.sameSite === true ? 'Strict' :
        (opts.sameSite === false ? 'Lax' : opts.sameSite ))
      : ''

    this.header('Set-Cookie',cookieString)
    return this
  }

  // Convenience method for clearing cookies
  clearCookie(name,opts={}) {
    let options = Object.assign(opts, { expires: new Date(1), maxAge: -1000 })
    return this.cookie(name,'',options)
  }


  // Set content-disposition header and content type
  attachment() {
    // Check for supplied filename/path
    let filename = arguments.length > 0 ? path.parse(arguments[0]) : undefined
    this.header('Content-Disposition','attachment' + (filename ? '; filename="' + filename.base + '"' : ''))

    // If filename exits, attempt to set the type
    if (filename) { this.type(filename.ext) }
    return this
  }


  // TODO: use attachment() to set headers
  download(file) {
    // file, filename, options, fn
  }


  sendFile(file,opts={}) {
    let data = fs.readFileSync(file)
    this._isBase64 = true
    this.send(data.toString('base64'))
  }


  // TODO: type
  type(type) {
    let mimeType = mimeLookup(type,this.app._mimeTypes)
    if (mimeType) {
      this.header('Content-Type',mimeType)
    }
    return this
  }


  // TODO: sendStatus



  // Sends the request to the main callback
  send(body) {

    // Create the response
    const response = {
      headers: this._headers,
      statusCode: this._statusCode,
      body: encodeBody(body),
      isBase64Encoded: this._isBase64
    }

    // Trigger the callback function
    return this.app._callback(null, response)

  } // end send

  // Trigger API error
  error(err) {
    // Reject promise
    this.app._reject(err)
  } // end error

} // end Response class


// Export the response object
module.exports = RESPONSE
