const request = require('request')
const VError = require('verror')
const HttpError = require('../errors/http')
const util = require('util')

function Marathon(host, port) {
    this.host = host;
    this.port = port;
}

function toApp(marathonApp) {
	return {
		"name": marathonApp.id,
		"instances": {
			"requested": marathonApp.instances,
			"running": marathonApp.tasksRunning,
			"healthy": marathonApp.tasksHealthy
		}
	}
}


function newApp(appName, instances) {
	return {
		"id": appName,
		"container": {
			"type": "DOCKER",
			"docker": {
				"image": "nginx:1.9.4",
				"network": "BRIDGE",
				"portMappings": [
					{
						"containerPort": 80,
						"hostPort": 0,
						"protocol": "tcp"
					}
				]
			}
		},
		"instances": instances,
		"cpus": 0.1,
		"mem": 16,
		"healthChecks": [
			{
				"protocol": "TCP",
				"gracePeriodSeconds": 60,
				"intervalSeconds": 10,
				"portIndex": 0,
				"timeoutSeconds": 5,
				"maxConsecutiveFailures": 3
			}
		]
	}
}

// get details about all apps
Marathon.prototype.apps = function() {
	var url = util.format('http://%s:%s/v2/apps?embed=apps.counts', this.host, this.port)
	console.log(util.format('marathon apps request: %s', url))
	return new Promise(function(resolve, reject) {
		request.get(url, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'marathon apps request error'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('marathon apps request failed: %j', res)
				reject(new HttpError(res.statusCode, 'marathon apps request failed') )
				return
			}

			var mApps = JSON.parse(body).apps
			var apps = []
			for (var i in mApps) {
				apps.push(toApp(mApps[i]))
			}
			resolve(apps)
		})
	})
}

// get details about an app
// returns Promise
Marathon.prototype.app = function(appName) {
	var url = util.format('http://%s:%s/v2/apps/%s?embed=apps.counts', this.host, this.port, appName)
	console.log(util.format('marathon app request: %s', url))
	return new Promise(function(resolve, reject) {
		request.get(url, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'marathon app request error'))
				return
			}
			if (res.statusCode == 404) {
				console.error('marathon app request failed: %j', res)
				reject(new HttpError(res.statusCode, 'marathon app does not exist'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('marathon app request failed: %j', res)
				reject(new HttpError(res.statusCode, 'marathon app request failed') )
				return
			}
			var mApp = JSON.parse(body).app
			var app = toApp(mApp)
			resolve(app)
		})
	})
}

// create app
// returns Promise
Marathon.prototype.createApp = function(appName, instances) {
	instances = instances || 1
	var url = util.format('http://%s:%s/v2/apps/%s?embed=apps.counts', this.host, this.port, appName)
	console.log(util.format('marathon app create: %s', url))
	return new Promise(function(resolve, reject) {
		request({
			url: url,
			method: 'PUT',
			json: newApp(appName, instances)
		}, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'marathon app create error'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('marathon app create failed: %j', res)
				reject(new HttpError(res.statusCode, 'marathon app create failed') )
				return
			}
			resolve(body)
		})
	})
}

// delete app
// returns Promise
Marathon.prototype.deleteApp = function(appName) {
	var url = util.format('http://%s:%s/v2/apps/%s?embed=apps.counts', this.host, this.port, appName)
	console.log(util.format('marathon app delete: %s', url))
	return new Promise(function(resolve, reject) {
		request({
			url: url,
			method: 'DELETE',
		}, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'marathon app delete error'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('marathon app delete failed: %j', res)
				reject(new HttpError(res.statusCode, 'marathon app delete failed') )
				return
			}
			resolve(body)
		})
	})
}

module.exports = Marathon
