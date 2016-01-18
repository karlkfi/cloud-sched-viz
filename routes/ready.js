const express = require('express');
var router = express.Router();

/* GET ready page. */
router.get('/', function(req, res) {
	res.render('ready', {
		title: 'Cloud Scheduling Visualizer',
		message: 'Ready'
	});
});

module.exports = router;
