'use strict'

const Promise = require('bluebird');

module.exports = {

  app: function(req,res) {
    // do something
    res.json({ method:'get', status:'ok', app:'app1'})
  },

  promise: function(req,res) {
    let start = Date.now()
    Promise.try(() => {
      for(let i = 0; i<40000000; i++) {}
      return true
    }).then((x) => {
      res.json({ method:'get', status:'ok', app:'app2'})
    })
  },

  calledError: function(req,res) {
    res.status(500).error('This is a called module error')
  },

  thrownError: function(req,res) {
    throw new Error('This is a thrown module error')
  },

  dataTest: function(req,res) {
    // Use data namespace
    let data = req.ns.data.dataCall()
    res.json({ method:'get', status:'ok', data: data })
  },

} // end exports
