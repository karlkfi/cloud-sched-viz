const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Cloud Scheduling Visualizer' });
});

module.exports = router;
