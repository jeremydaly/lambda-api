'use strict'

module.exports = function(app, opts) {

  app.get('/test-register', function(req,res) {
    res.json({ path: req.path, route: req.route, method: req.method })
  })

  app.get('/test-register/sub1', function(req,res) {
    res.json({ path: req.path, route: req.route, method: req.method })
  })

  app.get('test-register/:param1/test/', function(req,res) {
    res.json({ path: req.path, route: req.route, method: req.method, params: req.params })
  })

  if (opts.prefix === '/vX/vY') {
    app.register(require('./_testRoutes-v1'), { prefix: '/vZ' })
  }

  app.get('/test-register/sub2/', function(req,res) {
    res.json({ path: req.path, route: req.route, method: req.method })
  })

} // end
