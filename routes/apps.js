const HttpError = require('../errors/http');
const express = require('express')
var router = express.Router()

/*
 * GET app list.
 */
router.get('/', function(req, res) {
	var db = req.db
	res.json(db.table('apps'))
})

/*
 * GET app.
 */
router.get('/:id', function(req, res) {
	var db = req.db
	var appId = req.params.id
	var appData = db.selectOne('apps', 'name', appId)
	if (appData === null) {
		throw new HttpError('app not found: ' + appId, 404)
	}
	res.json(appData)
})

/*
 * POST to adduser.
 */
//router.post('/adduser', function(req, res) {
//	var db = req.db
//	var collection = db.get('userlist')
//	collection.insert(req.body, function(err, result){
//		res.send(
//			(err === null) ? { msg: '' } : { msg: err }
//		)
//	})
//})

/*
 * DELETE to deleteuser.
 */
//router.delete('/deleteuser/:id', function(req, res) {
//	var db = req.db
//	var collection = db.get('userlist')
//	var userToDelete = req.params.id
//	collection.remove({ '_id' : userToDelete }, function(err) {
//		res.send((err === null) ? { msg: '' } : { msg:'error: ' + err })
//	})
//})

module.exports = router
