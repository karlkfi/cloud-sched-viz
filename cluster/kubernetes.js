function Kubernetes(name) {
    this.name = name;
    this.data = {}
}

// get all the rows in a table
Kubernetes.prototype.app = function(appName) {
	var table = this.data[appName]
	if (table === null) {
		throw new Error('table not found: ' + appName)
	}
	return table
}

// select all rows in a table where key = value
Kubernetes.prototype.selectAll = function(appName, key, value) {
	var table = this.data[appName]
	if (table === null) {
		throw new Error('table not found: ' + appName)
	}
	var output = []
	for (var i in table) {
		if (table[i][key] == value) {
			output.push(table[i])
		}
	}
	return output
}

// select the first row in a table where key = value
Kubernetes.prototype.selectOne = function(appName, key, value) {
	var table = this.data[appName]
	if (table === null) {
		throw new Error('table not found: ' + appName)
	}
	for (var i in table) {
		if (table[i][key] == value) {
			return table[i]
		}
	}
	return null
}

Kubernetes.prototype.createTable = function(appName) {
	if (this.data[appName] != null) {
		throw new Error('table already exists: ' + appName)
	}
	this.data[appName] = []
}

Kubernetes.prototype.insertRow = function(appName, row) {
	this.data[appName].push(row)
}

module.exports = Kubernetes
