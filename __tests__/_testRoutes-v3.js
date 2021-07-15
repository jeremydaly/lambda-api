'use strict'

module.exports = function(app, opts) {

  app.get('/test-register-no-options', function(req,res) {
    res.json({ path: req.path, route: req.route, method: req.method })
  })

} // end
