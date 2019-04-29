const request = require('request')
const VError = require('verror')
const HttpError = require('../errors/http')
const util = require('util')
const k8s = require('@kubernetes/client-node')

function Kubernetes(host, port, bearerToken) {
		var server = util.format(
			'https://%s%s',
			host,
			port ? ':' + port : ':443'
		)

		var kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromClusterAndUser(
			{ server: server, skipTLSVerify: true, },
			{ token: bearerToken, },
		)
		kubeconfig.applyToRequest({
			"requestCert": false,
			"rejectUnauthorized": false,
		});

		//this.k8sApi = kubeconfig.makeApiClient(k8s.Core_v1Api);
		this.k8sApi = kubeconfig.makeApiClient(k8s.Apps_v1Api);
}

function toApp(deployment) {
	return {
		"name": deployment.metadata.name,
		"instances": {
			"requested": deployment.spec.replicas,
			"running": deployment.status.updatedReplicas || 0,
			"healthy": deployment.status.readyReplicas || 0,
		},
	}
}

function newDeployment(appName, instances) {
	return {
		"kind": "Deployment",
		"metadata": {
			"name": appName,
		},
		"spec": {
			"replicas": instances,
			"selector": {
				"matchLabels": {
					"deployment": appName,
				},
			},
			"template": {
				"metadata": {
					"labels": {
						"deployment": appName,
					},
				},
				"spec": {
					"containers": [
						{
							"name": "nginx",
							"image": "nginx:1.9.4",
							"ports": [
								{
									"name": "http",
									"containerPort": 80,
									"hostPort": 0,
								}
							],
							"resources": {
								"limits": {
									"cpu": 0.1,
									"memory": "16M",
								},
							},
							"livenessProbe": {
								"tcpSocket": {
									"port": "http",
								},
								"initialDelaySeconds": 5,
								"timeoutSeconds": 5,
							},
						},
					],
				},
			},
		},
	}
}

// get details about all apps
Kubernetes.prototype.apps = function() {
	var namespace = "default"
	var k8sApi = this.k8sApi
	return new Promise(function(resolve, reject) {
		k8sApi.listNamespacedDeployment(namespace).then(
			(result) => {
				if (result.response.statusCode < 200 || result.response.statusCode >= 400) {
					console.error('kubernetes apps request failed: %j', result.response)
					reject(new HttpError(result.response.statusCode, 'kubernetes apps request failed') )
					return
				}
				var mApps = result.body.items
				var apps = []
				for (var i in mApps) {
					apps.push(toApp(mApps[i]))
				}
				resolve(apps)
			},
			(err) => {
				console.error('kubernetes apps request failed: %j', err)
				reject(new VError(err, 'kubernetes apps request error'))
			},
		)
	})
}

// get details about an app
// returns Promise
Kubernetes.prototype.app = function(appName) {
	var namespace = "default"
	var k8sApi = this.k8sApi
	return new Promise(function(resolve, reject) {
		k8sApi.readNamespacedDeployment(appName, namespace).then(
			(result) => {
				if (result.response.statusCode == 404) {
					console.error('kubernetes app request failed: %j', result.response)
					reject(new HttpError(result.response.statusCode, 'kubernetes app does not exist'))
					return
				}
				if (result.response.statusCode < 200 || result.response.statusCode >= 400) {
					console.error('kubernetes app request failed: %j', result.response)
					reject(new HttpError(result.response.statusCode, 'kubernetes app request failed') )
					return
				}
				var mApp = result.body
				var app = toApp(mApp)
				resolve(app)
			},
			(err) => {
				console.error('kubernetes app request failed: %j', err)
				reject(new VError(err, 'kubernetes app request error'))
			},
		)
	})
}

// create app
// returns Promise
Kubernetes.prototype.createApp = function(appName, instances) {
	instances = instances || 1

	var namespace = "default"
	var k8sApi = this.k8sApi
	return new Promise(function(resolve, reject) {
		k8sApi.createNamespacedDeployment(namespace, newDeployment(appName, instances)).then(
			(result) => {
				if (result.response.statusCode < 200 || result.response.statusCode >= 400) {
					console.error('kubernetes app create failed: %j', result.response)
					reject(new HttpError(result.response.statusCode, 'kubernetes app create failed') )
					return
				}
				var mApp = result.body
				var app = toApp(mApp)
				resolve(app)
			},
			(err) => {
				console.error('kubernetes app create failed: %j', err)
				reject(new VError(err, 'kubernetes app create error'))
			},
		)
	})
}

// delete app
// returns Promise
Kubernetes.prototype.deleteApp = function(appName) {
	var namespace = "default"
	var k8sApi = this.k8sApi
	return new Promise(function(resolve, reject) {
		k8sApi.deleteNamespacedDeployment(appName, namespace).then(
			(result) => {
				if (result.response.statusCode < 200 || result.response.statusCode >= 400) {
					console.error('kubernetes app delete failed: %j', result.response)
					reject(new HttpError(result.response.statusCode, 'kubernetes app delete failed') )
					return
				}
				if (result.body.status != "Success") {
					console.error('kubernetes app delete failed: %j', result.body)
					reject(new VError(err, 'kubernetes app delete error'))
				}
				resolve({
					"name": appName,
					"instances": {
						"requested": 0,
						"running": 0,
						"healthy": 0,
					},
				})
			},
			(err) => {
				console.error('kubernetes app delete failed: %j', err)
				reject(new VError(err, 'kubernetes app delete error'))
			},
		)
	})
}

module.exports = Kubernetes
