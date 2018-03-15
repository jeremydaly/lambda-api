'use strict'

/**
 * Lightweight Node.js API for AWS Lambda
 * @author Jeremy Daly <jeremy@jeremydaly>
 * @license MIT
 */

const escapeHtml = require('./utils.js').escapeHtml;
const encodeUrl = require('./utils.js').encodeUrl;

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

  // TODO: Convenience method for JSONP
  // jsonp(body) {
  // 	this.header('Content-Type','application/json').send(JSON.stringify(body))
  // }

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
  }

  // TODO: cookie
  // TODO: clearCookie
  // TODO: attachement
  // TODO: download
  // TODO: location
  // TODO: sendFile
  // TODO: sendStatus
  // TODO: type


  // Sends the request to the main callback
  send(body) {

    // Create the response
    const response = {
      headers: this._headers,
      statusCode: this._statusCode,
      body: typeof body === 'object' ? JSON.stringify(body) : (body && typeof body !== 'string' ? body.toString() : (body ? body : ''))
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
