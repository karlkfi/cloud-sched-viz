const HttpError = require('../errors/http')
const express = require('express')
var router = express.Router()

// GET app list
router.get('/', function(req, res) {
	var cluster = req.cluster
	cluster.apps().then(function(appsData) {
		res.json(appsData)
	}, function(err) {
		res.sendError(new HttpError(err, err.statusCode || 500, 'failed to retrieve apps'))
	})
})

// GET app data
router.get('/:id', function(req, res) {
	var cluster = req.cluster
	var appName = req.params.id
	cluster.app(appName).then(function(appData) {
		res.json(appData)
	}, function(err) {
		res.sendError(new HttpError(err, err.statusCode || 500, 'failed to retrieve app "%s"', appName))
	})
})

// PUT new app
router.put('/:id', function(req, res) {
	var cluster = req.cluster
	var appName = req.params.id
	var instances = req.body.instances
	cluster.createApp(appName, instances).then(function(appData) {
		res.json(appData)
	}, function(err) {
		res.sendError(new HttpError(err, err.statusCode || 500, 'failed to create app "%s"', appName))
	})
})

// DELETE app
router.delete('/:id', function(req, res) {
	var cluster = req.cluster
	var appName = req.params.id
	cluster.deleteApp(appName).then(function(appData) {
		res.json(appData)
	}, function(err) {
		res.sendError(new HttpError(err, err.statusCode || 500, 'failed to delete app "%s"', appName))
	})
})

module.exports = router
