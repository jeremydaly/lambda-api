'use strict'

/**
 * Lightweight web framework for your serverless applications
 * @author Jeremy Daly <jeremy@jeremydaly.com>
 * @license MIT
 */

const UTILS = require('./utils.js')

const fs = require('fs') // Require Node.js file system
const path = require('path') // Require Node.js path
const { ResponseError, FileError } = require('./errors') // Require custom errors

// Require AWS S3 service
const S3 = require('./s3-service')

class RESPONSE {

  // Create the constructor function.
  constructor(app,request) {

    // Add a reference to the main app
    app._response = this

    // Create a reference to the app
    this.app = app

    // Create a reference to the request
    this._request = request

    // Create a reference to the JSON serializer
    this._serializer = app._serializer

    // Set the default state to processing
    this._state = 'processing'

    // Default statusCode to 200
    this._statusCode = 200

    // Default the header
    this._headers = {
      // Set the Content-Type by default
      'content-type': 'application/json' //charset=UTF-8
    }

    // base64 encoding flag
    this._isBase64 = false

    // Default callback function
    this._callback = 'callback'

    // Default Etag support
    this._etag = false

    // Default response object
    this._response = {}
  }

  // Sets the statusCode
  status(code) {
    this._statusCode = code
    return this
  }

  // Adds a header field
  header(key,value) {
    let _key = key.toLowerCase() // store as lowercase
    value = value !== undefined ? value : '' // default value
    this._headers[_key] = value // set
    return this
  }

  // Gets a header field
  getHeader(key) {
    if (!key) return this._headers // return all headers
    return this._headers[key.toLowerCase()]
  }

  // Removes a header field
  removeHeader(key) {
    delete this._headers[key.toLowerCase()]
    return this
  }

  // Returns boolean if header exists
  hasHeader(key) {
    return this.getHeader(key ? key : '') !== undefined
  }

  // Convenience method for JSON
  json(body) {
    this.header('Content-Type','application/json').send(this._serializer(body))
  }

  // Convenience method for JSONP
  jsonp(body) {
    // Check the querystring for callback or cb
    let query = this.app._event.queryStringParameters || {}
    let cb = query[this.app._callbackName]

    this.header('Content-Type','application/json')
      .send((cb ? cb.replace(' ','_') : 'callback') + '(' + this._serializer(body) + ')')
  }

  // Convenience method for HTML
  html(body) {
    this.header('Content-Type','text/html').send(body)
  }

  // Convenience method for setting Location header
  location(path) {
    this.header('Location',UTILS.encodeUrl(path))
    return this
  }

  // Convenience method for Redirect
  async redirect(path) {
    let statusCode = 302 // default

    try {
      // If status code is provided
      if (arguments.length === 2) {
        if ([300,301,302,303,307,308].includes(arguments[0])) {
          statusCode = arguments[0]
          path = arguments[1]
        } else {
          throw new ResponseError(arguments[0] + ' is an invalid redirect status code',arguments[0])
        }
      }

      // Auto convert S3 paths to signed URLs
      if (UTILS.isS3(path)) path = await this.getLink(path)

      let url = UTILS.escapeHtml(path)

      this.location(path)
        .status(statusCode)
        .html(`<p>${statusCode} Redirecting to <a href="${url}">${url}</a></p>`)

    } catch(e) {
      this.error(e)
    }
  } // end redirect

  // Convenience method for retrieving a signed link to an S3 bucket object
  async getLink(path,expires,callback) {
    let params = UTILS.parseS3(path)

    // Default Expires
    params.Expires = !isNaN(expires) ? parseInt(expires) : 900

    // Default callback
    let fn = typeof expires === 'function' ? expires :
      typeof callback === 'function' ? callback : e => { if (e) this.error(e) }

    // getSignedUrl doesn't support .promise()
    return await new Promise(r => S3.getSignedUrl('getObject',params, async (e,url) => {
      if (e) {
        // Execute callback with caught error
        await fn(e)
        this.error(e) // Throw error if not done in callback
      }
      r(url) // return the url
    }))
  } // end getLink

  // Convenience method for setting cookies
  // see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
  cookie(name,value,opts={}) {

    // Set the name and value of the cookie
    let cookieString = (typeof name !== 'string' ? name.toString() : name)
      + '=' + encodeURIComponent(UTILS.encodeBody(value))

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
  async sendFile(file, options, callback) {

    let buffer, modified

    let opts = typeof options === 'object' ? options : {}
    let fn = typeof callback === 'function' ? callback : () => {}

    // Add optional parameter support
    if (typeof options === 'function') {
      fn = options
    }

    // Begin a try-catch block for callback errors
    try {

      // Create buffer based on input
      if (typeof file === 'string') {

        let filepath = file.trim()

        // If an S3 file identifier
        if (/^s3:\/\//i.test(filepath)) {

          let params = UTILS.parseS3(filepath)

          // Attempt to get the object from S3
          let data = await S3.getObject(params).promise()

          // Set results, type and header
          buffer = data.Body
          modified = data.LastModified
          this.type(data.ContentType)
          this.header('ETag',data.ETag)

        // else try and load the file locally
        } else {
          buffer = fs.readFileSync((opts.root ? opts.root : '') + filepath)
          modified = opts.lastModified !== false ? fs.statSync((opts.root ? opts.root : '') + filepath).mtime : undefined
          this.type(path.extname(filepath))
        }
      // If the input is a buffer, pass through
      } else if (Buffer.isBuffer(file)) {
        buffer = file
      } else {
        throw new FileError('Invalid file',{path:file})
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
          this.cache(opts.cacheControl)
        } else {
          this.cache(
            !isNaN(opts.maxAge) ? opts.maxAge : 0,
            opts.private
          )
        }
      }

      // Add last-modified headers
      if (opts.lastModified !== false) {
        this.modified(opts.lastModified ? opts.lastModified : modified)
      }

      // Execute callback
      await fn()

      // Set base64 encoding flag
      this._isBase64 = true
      // Convert buffer to base64 string
      this.send(buffer.toString('base64'))

    } catch(e) { // TODO: Add second catch?
      // Execute callback with caught error
      await fn(e)

      // If missing file
      if (e.code === 'ENOENT') {
        this.error(new FileError('No such file',e))
      } else {
        this.error(e)  // Throw error if not done in callback
      }
    }

  } // end sendFile


  // Convenience method for setting type
  type(type) {
    let mimeType = UTILS.mimeLookup(type,this.app._mimeTypes)
    if (mimeType) {
      this.header('Content-Type',mimeType)
    }
    return this
  }



  // TODO: sendStatus


  // Convenience method for setting CORS headers
  cors(options) {
    const opts = typeof options === 'object' ? options : {}

    // Check for existing headers
    let acao = this.getHeader('Access-Control-Allow-Origin')
    let acam = this.getHeader('Access-Control-Allow-Methods')
    let acah = this.getHeader('Access-Control-Allow-Headers')

    // Default CORS headers
    this.header('Access-Control-Allow-Origin',opts.origin ? opts.origin : (acao ? acao : '*'))
    this.header('Access-Control-Allow-Methods',opts.methods ? opts.methods : (acam ? acam : 'GET, PUT, POST, DELETE, OPTIONS'))
    this.header('Access-Control-Allow-Headers',opts.headers ? opts.headers : (acah ? acah : 'Content-Type, Authorization, Content-Length, X-Requested-With'))

    // Optional CORS headers
    if(opts.maxAge && !isNaN(opts.maxAge)) this.header('Access-Control-Max-Age',(opts.maxAge/1000|0).toString())
    if(opts.credentials) this.header('Access-Control-Allow-Credentials',opts.credentials.toString())
    if(opts.exposeHeaders) this.header('Access-Control-Expose-Headers',opts.exposeHeaders)

    return this
  }


  // Enable/Disable Etag
  etag(enable) {
    this._etag = enable === true ? true : false
    return this
  }

  // Add cache-control headers
  cache(maxAge,isPrivate=false) {
    // if custom string value
    if (maxAge !== true && maxAge !== undefined && typeof maxAge === 'string') {
      this.header('Cache-Control', maxAge)
    } else if (maxAge === false) {
      this.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    } else {
      maxAge = maxAge && !isNaN(maxAge) ? (maxAge/1000|0) : 0
      this.header('Cache-Control', (isPrivate === true ? 'private, ' : '') + 'max-age=' + maxAge)
      this.header('Expires',new Date(Date.now() + maxAge).toUTCString())
    }
    return this
  }

  // Add last-modified headers
  modified(date) {
    if (date !== false) {
      let lastModified = date && typeof date.toUTCString === 'function' ? date :
        date && Date.parse(date) ? new Date(date) : new Date()
      this.header('Last-Modified', lastModified.toUTCString())
    }
    return this
  }

  // Sends the request to the main callback
  send(body) {

    // Generate Etag
    if ( this._etag // if etag support enabled
      && ['GET','HEAD'].includes(this._request.method)
      && !this.hasHeader('etag')
      && this._statusCode === 200
    ) {
      this.header('etag','"'+UTILS.generateEtag(body)+'"')
    }

    // Check for matching Etag
    if (
      this._request.headers['if-none-match']
      && this._request.headers['if-none-match'] === this.getHeader('etag')
    ) {
      this.status(304)
      body = ''
    }

    // Create the response
    this._response = {
      headers: this._headers,
      statusCode: this._statusCode,
      body: this._request.method === 'HEAD' ? '' : UTILS.encodeBody(body,this._serializer),
      isBase64Encoded: this._isBase64
    }

    // Trigger the callback function
    this.app._callback(null, this._response, this)

  } // end send


  // Trigger API error
  error(code,e,detail) {
    detail = typeof code !== 'number' && e !== undefined ? e : detail
    e = typeof code !== 'number' ? code : e
    code = typeof code === 'number' ? code : 500
    this.app.catchErrors(e,this,code,detail)
  } // end error

} // end Response class


// Export the response object
module.exports = RESPONSE
