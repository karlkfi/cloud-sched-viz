const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const parseArgs = require('minimist')
const HttpError = require('./errors/http')

var app = express()

var argv = parseArgs(process.argv.slice(2))
console.log('Args: ', JSON.stringify(argv))

const ClusterClientBuilder = require('./cluster/builder')
var cluster = new ClusterClientBuilder().
	type(argv['api-type']).
	host(argv['api-host']).
	port(argv['api-port']).
	build()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// TODO: favicon
//app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Make the cluster client accessible to our router
app.use(function(req, res, next){
	req.cluster = cluster
	next()
})


/// error handlers

// prod: no stack trace
var sendError = function(res, err) {
	err.stack = null
	res.status(err.statusCode || 500)
	res.render('error', {
		message: err.message,
		error: err
	})
}

// dev: print stack trace
if (app.get('env') === 'development') {
	sendError = function(res, err) {
    	res.status(err.statusCode || 500)
    	res.render('error', {
    		message: err.message,
    		error: err
    	})
    }
}

// add async error handler to router response
// arg modifications much be defined before route handlers
app.use(function(req, res, next){
	res.sendError = function(err) { return sendError(this, err) }
	next()
})

app.use('/', require('./routes/index'))
app.use('/apps', require('./routes/apps'))
app.use('/ready', require('./routes/ready'))

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	next(new HttpError(404, 'unknown resource'))
})

// handle synchronous thrown errors
app.use(function(err, req, res, next) {
	sendError(res, err)
})

module.exports = app
