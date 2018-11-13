const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

// Show Admin Panel
router.get('/', function(req, res){
	if(req.user.username == "admin"){
		res.render('admin');
	} else {
		res.render('error');
	}
});

module.exports = router;