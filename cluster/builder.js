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

ClientBuilder.prototype.build = function() {
	if (this.type === null) {
		throw new Error('unspecified cluster api type')
	}
	if (this.host === null) {
		throw new Error('unspecified cluster api host')
	}
	if (this.port === null) {
		throw new Error('unspecified cluster api port')
	}

	var client = null
	switch (this.type) {
	case 'kubernetes':
		var Kubernetes = require('./kubernetes')
		client = new Kubernetes(this.host, this.port, this.pathPrefix)
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
