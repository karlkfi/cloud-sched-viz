const util = require('util')
const VError = require('verror')

/*
 * HttpError([cause], statusCode, fmt[, arg...]):
 * Like JavaScript's built-in Error class, but supports a "cause" argument (another error),
 * an http status code, and a printf-style message.  The cause argument can be null or omitted entirely.
 *
 * Examples:
 *
 * CODE                                            MESSAGE
 * new HttpError(500, 'something bad happened')    "something bad happened"
 * new HttpError(404, 'missing file: "%s"', file)  "missing file: "/etc/passwd"
 *   with file = '/etc/passwd'
 * new HttpError(err, 500, 'open failed')          "open failed: file not found"
 *   with err.message = 'file not found'
 */
function HttpError(options) {
	// set stack
	Error.captureStackTrace(this, this.constructor)

	// set error name
	this.name = this.constructor.name

	// arguments isn't technically an array, slice it to make it one
	var args = Array.prototype.slice.call(arguments, 0)

	var cause;
	if (options instanceof Error) {
		cause = options
		args = args.slice(1)
	}
	this.jse_cause = cause

	// statusCode is required
	var statusCode = args[0]
	if (isNaN(statusCode) || statusCode < 400) {
		throw new VError('status code (%s) must be a number (400+)', statusCode)
	}
	this.statusCode = statusCode
	args = args.slice(1)

	// format message, if required
	var msg;
	if (args.length > 1) {
		msg = util.format.apply(null, args)
	} else {
		msg = args[0] || ''
	}
	this.jse_shortmsg = msg

	// concatenate messages
	this.jse_summary = msg
	if (cause) {
		this.jse_summary += ': ' + cause.message
	}
	this.message = this.jse_summary
}
util.inherits(HttpError, VError)

module.exports = HttpError
