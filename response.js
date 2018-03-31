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

const Promise = require('bluebird') // Promise library


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
  attachment(filename) {
    // Check for supplied filename/path
    let name = typeof filename === 'string' && filename.trim().length > 0 ? path.parse(filename) : undefined
    this.header('Content-Disposition','attachment' + (name ? '; filename="' + name.base + '"' : ''))

    // If name exits, attempt to set the type
    if (name) { this.type(name.ext) }
    return this
  }


  // Convenience method combining attachment() and sendFile()
  download(file, filename, options, callback) {

    let name = filename
    let opts = typeof options === 'object' ? options : {}
    let fn = typeof callback === 'function' ? callback : undefined

    // Add optional parameter support for callback
    if (typeof filename === 'function') {
      name = undefined
      fn = filename
    } else if (typeof options === 'function') {
      fn = options
    }

    // Add optional parameter support for options
    if (typeof filename === 'object') {
      name = undefined
      opts = filename
    }

    // Add the Content-Disposition header
    this.attachment(name ? name : (typeof file === 'string' ? path.basename(file) : null) )

    // Send the file
    this.sendFile(file, opts, fn)

  }


  // Convenience method for returning static files
  sendFile(file, options, callback) {

    let buffer, modified

    let opts = typeof options === 'object' ? options : {}
    let fn = typeof callback === 'function' ? callback : e => { if(e) this.error(e) }

    // Add optional parameter support
    if (typeof options === 'function') {
      fn = options
    }

    // Begin a promise chain
    Promise.try(() => {

      // Create buffer based on input
      if (typeof file === 'string') {
        if (/^s3:\/\//i.test(file)) {
          console.log('S3');
          buffer = 'empty'
        } else {
          buffer = fs.readFileSync((opts.root ? opts.root : '') + file)
          modified = opts.lastModified !== false ? fs.statSync((opts.root ? opts.root : '') + file).mtime : undefined
          this.type(path.extname(file))
        }
      } else if (Buffer.isBuffer(file)) {
        buffer = file
      } else {
        throw new Error('Invalid file')
      }

      // Add headers from options
      if (typeof opts.headers === 'object') {
        Object.keys(opts.headers).map(header => {
          this.header(header,opts.headers[header])
        })
      }

      // Add cache-control headers
      if (opts.cacheControl !== false) {
        if (opts.cacheControl !== true && opts.cacheControl !== undefined) {
          this.header('Cache-Control', opts.cacheControl)
        } else {
          let maxAge = opts.maxAge && !isNaN(opts.maxAge) ? (opts.maxAge/1000|0) : 0
          this.header('Cache-Control', (opts.private === true ? 'private, ' : '') + 'max-age=' + maxAge)
          this.header('Expires',new Date(Date.now() + maxAge).toUTCString())
        }
      }

      // Add last-modified headers
      if (opts.lastModified !== false) {
        let lastModified = opts.lastModified && typeof opts.lastModified.toUTCString === 'function' ? opts.lastModified : (modified ? modified : new Date())
        this.header('Last-Modified', lastModified.toUTCString())
      }

    }).then(() => {
      // Execute callback
      return Promise.resolve(fn())
    }).then(() => {
      // Set base64 encoding flag
      this._isBase64 = true
      // Convert buffer to base64 string
      this.send(buffer.toString('base64'))
    }).catch(e => {
      // Execute callback with caught error
      return Promise.resolve(fn(e))
    }).catch(e => {
      // Catch any final error
      this.error(e)
    })

  } // end sendFile


  // Convenience method for setting type
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
