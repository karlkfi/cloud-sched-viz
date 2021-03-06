const fs = require('fs')

function ClientBuilder() {}

ClientBuilder.prototype.type = function(type) {
	this.type = type
	return this
}

ClientBuilder.prototype.host = function(host) {
	this.host = host
	return this
}

ClientBuilder.prototype.port = function(port) {
	this.port = port
	return this
}

ClientBuilder.prototype.pathPrefix = function(pathPrefix) {
	this.pathPrefix = pathPrefix
	return this
}

ClientBuilder.prototype.bearerToken = function(bearerToken) {
	this.bearerToken = bearerToken
	return this
}

ClientBuilder.prototype.bearerTokenFile = function(bearerTokenFile) {
	this.bearerTokenFile = bearerTokenFile
	return this
}

ClientBuilder.prototype.build = function() {
	if (this.type === null) {
		throw new Error('unspecified cluster api type')
	}
	if (this.host === null) {
		throw new Error('unspecified cluster api host')
	}

	var client = null
	switch (this.type) {
	case 'kubernetes':
		var Kubernetes = require('./kubernetes')
		if (this.bearerTokenFile !== undefined) {
			this.bearerToken = fs.readFileSync(this.bearerTokenFile, 'utf8');
		}
		client = new Kubernetes(this.host, this.port, this.bearerToken)
		break
	case 'marathon':
		var Marathon = require('./marathon')
		client = new Marathon(this.host, this.port, this.pathPrefix)
		break
	default:
		throw new Error('unknown cluster type: ' + this.type)
	}
	return client
}

module.exports = ClientBuilder
