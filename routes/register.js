const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');

// Show Sign Up Form
router.get('/', function(req, res){
	res.render('welcome');
});

// Add user to database
router.post('/', function(req, res){
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('username', 'Username is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password2', 'Passwords do not match.').equals(req.body.password);
	req.checkBody('password', 'Password is too short.').isLength({ min:6 });

	let errors = req.validationErrors();

	// Custom Errors
	if(errors == false){
		if(username.split(' ').join('') == ""){
			errors = [{
				msg: 'Username is required.'
			}];
		} else if(password.split(' ').join('') == "") {
			errors = [{
				msg: 'Password is required.'
			}];
		} else if(/\s/.test(username)){
			errors = [{
				msg: 'Username may not contain spaces.'
			}];
		} else if(/\s/.test(password)){
			errors = [{
				msg: 'Password may not contain spaces.'
			}];
		}

		// Check if username is taken
		User.find({'username': username}, function(err, user) {
			if(err){
				console.log(err);
				return err;
			} else if(user.length!=0) {
          		if(user[0].username){
          			errors = [{
						msg: 'Username is taken.'
					}];                    
             	}	
            }
            newUser();  
		});
	} else {
		newUser();
	}

	// Registration
	function newUser() {
		if(errors){
			req.flash('error', errors[0].msg);
			res.render('welcome');
		} else {
			let newUser = new User({
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
	}

});

module.exports = router;