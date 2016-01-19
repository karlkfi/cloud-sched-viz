const request = require('request')
const VError = require('verror')
const HttpError = require('../errors/http')
const util = require('util')

//TODO: Kubernetes support
function Kubernetes(host, port, pathPrefix) {
    this.host = host
    this.port = port
    this.pathPrefix = pathPrefix
}

function toApp(kubernetesApp) {
	return {
		"name": kubernetesApp.id,
		"instances": {
			"requested": kubernetesApp.instances,
			"running": kubernetesApp.tasksRunning,
			"healthy": kubernetesApp.tasksHealthy
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
				"gracePeriodSeconds": 5,
				"intervalSeconds": 5,
				"portIndex": 0,
				"timeoutSeconds": 5,
				"maxConsecutiveFailures": 3
			}
		]
	}
}

// get details about all apps
Kubernetes.prototype.apps = function() {
	var url = util.format('http://%s:%s/v2/apps?embed=apps.counts', this.host, this.port)
	console.log(util.format('kubernetes apps request: %s', url))
	return new Promise(function(resolve, reject) {
		request.get(url, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'kubernetes apps request error'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('kubernetes apps request failed: %j', res)
				reject(new HttpError(res.statusCode, 'kubernetes apps request failed') )
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
Kubernetes.prototype.app = function(appName) {
	var url = util.format('http://%s:%s/v2/apps/%s?embed=apps.counts', this.host, this.port, appName)
	console.log(util.format('kubernetes app request: %s', url))
	return new Promise(function(resolve, reject) {
		request.get(url, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'kubernetes app request error'))
				return
			}
			if (res.statusCode == 404) {
				console.error('kubernetes app request failed: %j', res)
				reject(new HttpError(res.statusCode, 'kubernetes app does not exist'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('kubernetes app request failed: %j', res)
				reject(new HttpError(res.statusCode, 'kubernetes app request failed') )
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
Kubernetes.prototype.createApp = function(appName, instances) {
	instances = instances || 1
	var url = util.format('http://%s:%s/v2/apps/%s?embed=apps.counts', this.host, this.port, appName)
	console.log(util.format('kubernetes app create: %s', url))
	return new Promise(function(resolve, reject) {
		request({
			url: url,
			method: 'PUT',
			json: newApp(appName, instances)
		}, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'kubernetes app create error'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('kubernetes app create failed: %j', res)
				reject(new HttpError(res.statusCode, 'kubernetes app create failed') )
				return
			}
			resolve(body)
		})
	})
}

// delete app
// returns Promise
Kubernetes.prototype.deleteApp = function(appName) {
	var url = util.format('http://%s:%s/v2/apps/%s?embed=apps.counts', this.host, this.port, appName)
	console.log(util.format('kubernetes app delete: %s', url))
	return new Promise(function(resolve, reject) {
		request({
			url: url,
			method: 'DELETE',
		}, function (err, res, body) {
			if (err) {
				reject(new VError(err, 'kubernetes app delete error'))
				return
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				console.error('kubernetes app delete failed: %j', res)
				reject(new HttpError(res.statusCode, 'kubernetes app delete failed') )
				return
			}
			resolve(body)
		})
	})
}

module.exports = Kubernetes
