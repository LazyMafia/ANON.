const express = require('express');
const passport = require('passport');
const router = express.Router();

// Bring in User Model
let Users = require('../models/users');

// Show Login Form
router.get('/', function(req, res){
	res.render('login');
});

// Login Process
router.post('/', function(req, res, next){
	// Missing Credentials
	if(!req.body.username || !req.body.password){
		if(!req.body.username){
			req.flash("Missing username.")
		} else {
			req.flash("Missing password.")
		}
	}

	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	})(req, res, next);
});

module.exports = router;