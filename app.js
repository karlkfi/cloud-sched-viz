const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const HttpError = require('./errors/http')

// Database
const Database = require('./db/memory')
var db = new Database('in-memory-database')

// Test Data
db.createTable('apps')
db.insertRow('apps', {
	'name': 'fake-app-1',
	'instances': {
		'requested': 5,
		'running': 3,
		'healthy': 3
	}
})

const routes = require('./routes/index')
const apps = require('./routes/apps')

var app = express()

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

// Make our db accessible to our router
app.use(function(req, res, next){
	req.db = db
	next()
})

app.use('/', routes)
app.use('/apps', apps)

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	next(new HttpError('Not Found', 404))
})

/// error handlers

// development error handler
// will print stack trace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500)
		res.render('error', {
			message: err.message,
			error: err
		})
	})
}

// production error handler
// no stack trace leaked to user
app.use(function(err, req, res, next) {
	err.stack = null
	res.status(err.status || 500)
	res.render('error', {
		message: err.message,
		error: err
	})
})


module.exports = app
