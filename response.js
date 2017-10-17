'use strict'

class RESPONSE {

  // Create the constructor function.
	constructor(app) {

		// Create a local copy of the app
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

	// TODO: cookie
	// TODO: clearCookie
	// TODO: attachement
	// TODO: download
	// TODO: location
	// TODO: redirect
	// TODO: sendFile
	// TODO: sendStatus
	// TODO: type


	// Sends the request to the main callback
  send(body) {

		// Create the response
    const response = {
      headers: this._headers,
      statusCode: this._statusCode,
      body: body
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
