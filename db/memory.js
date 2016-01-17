function InMemoryDB(name) {
    this.name = name;
    this.tables = {}
}

// get all the rows in a table
InMemoryDB.prototype.table = function(tableName) {
	var table = this.tables[tableName]
	if (table === null) {
		throw new Error('table not found: ' + tableName)
	}
	return table
}

// select all rows in a table where key = value
InMemoryDB.prototype.selectAll = function(tableName, key, value) {
	var table = this.tables[tableName]
	if (table === null) {
		throw new Error('table not found: ' + tableName)
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
InMemoryDB.prototype.selectOne = function(tableName, key, value) {
	var table = this.tables[tableName]
	if (table === null) {
		throw new Error('table not found: ' + tableName)
	}
	for (var i in table) {
		if (table[i][key] == value) {
			return table[i]
		}
	}
	return null
}

InMemoryDB.prototype.createTable = function(tableName) {
	if (this.tables[tableName] != null) {
		throw new Error('table already exists: ' + tableName)
	}
	this.tables[tableName] = []
}

InMemoryDB.prototype.insertRow = function(tableName, row) {
	this.tables[tableName].push(row)
}

module.exports = InMemoryDB
