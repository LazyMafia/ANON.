const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Bring in User Model
let Users = require('../models/users');

// Show Sign Up Form
router.get('/', function(req, res){
	res.render("register");
});

// Add user to databse
router.post('/', function(req, res){
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('username', 'Username is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password2', 'Passwords do not match.').equals(req.body.password);
	req.checkBody('password', 'Password is too short.').isLength({ min:6 });

	let errors = req.validationErrors();

	if(errors){
		req.flash('error', errors[0].msg);
		res.render('register');
	} else {
		let newUser = new Users({
			username:username,
			password:password
		});

		// Encrypt Password
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				if(err){
					console.log(err);
				}
				newUser.password = hash;
				newUser.save(function(err){
					if(err){
						console.log(err);
						return;
					} else {
						req.flash('success','You are now registered.');
						res.redirect('/login');
					}
				});
			});
		});
	}

});

module.exports = router;