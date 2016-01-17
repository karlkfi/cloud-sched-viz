const util = require('util')

function HttpError(message, statusCode) {
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = message;
	this.status = statusCode
}
util.inherits(HttpError, Error)

module.exports = HttpError