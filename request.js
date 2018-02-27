'use strict'

const QS = require('querystring') // Require the querystring library

class REQUEST {

  // Create the constructor function.
	constructor(app) {

		// Set the version
		this.version = app._version

		// Init the params
		this.params = {}

		// Set the method
		this.method = app._event.httpMethod.toUpperCase()

		// Set the path
		this.path = app._event.path

		// Set the query parameters
		this.query = app._event.queryStringParameters ? app._event.queryStringParameters : {}

		// Set the headers
		this.headers = app._event.headers

		// Set the requestContext
		this.requestContext = app._event.requestContext

		// Set the body
		if (this.headers['Content-Type'] && this.headers['Content-Type'].includes("application/x-www-form-urlencoded")) {
			this.body = QS.parse(app._event.body)
		} else if (typeof app._event.body === 'object') {
			this.body = app._event.body
		} else {
			try {
				this.body = JSON.parse(app._event.body)
			} catch(e) {
				this.body = app._event.body;
			}
		}

        // Extract path from event
        let path = app._event.path.trim()
        let queryIndex = path.indexOf('?')
        if(queryIndex >= 0){
            path = path.substring(0, queryIndex)
        }
        path = path.replace(/^\/(.*?)(\/)*$/,'$1').split('/')

		// Remove base if it exists
		if (app._base && app._base === path[0]) {
			path.shift()
		} // end remove base

		// Init the route
		this.route = null

		// Create a local routes reference
		let routes = app._routes

		// Loop the routes and see if this matches
		for (let i=0; i<path.length; i++) {
			if (routes[path[i]]) {
				routes = routes[path[i]]
			} else if (routes['__VAR__']) {
				routes = routes['__VAR__']
			} else {
				app._errorStatus = 404
				throw new Error('Route not found')
			}
		} // end for loop

		// Check for the requested method
		if (routes['__'+this.method]) {

			// Assign path parameters
			for (let x in routes['__'+this.method].vars) {
				this.params[routes['__'+this.method].vars[x]] = path[x]
			} // end for

			// Set the route used
			this.route = routes['__'+this.method].route

			// Set the handler
			app.handler = routes['__'+this.method].handler

		// TODO: This needs to start looking from the root (leave this for now)
		} else if (app._routes['*'] && app._routes['*']['__'+this.method]) {

			// Set the route used
			this.route = app._routes['*']['__'+this.method].route

			// Set the handler
			app.handler = app._routes['*']['__'+this.method].handler

		} else {
			app._errorStatus = 405;
			throw new Error('Method not allowed')
		}
  }

} // end REQUEST class

// Export the response object
module.exports = REQUEST
