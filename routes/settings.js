const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

// Show settings page
router.get('/', ensureAuthenticated, function(req, res){
	res.render('settings');
});

// Access Control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

module.exports = router;