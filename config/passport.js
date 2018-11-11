const LocalStrategy = require('passport-local').Strategy;
const Users = require('../models/users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
	// Local Strategy
	passport.use(new LocalStrategy(function(username, password, done){
		console.log("IN");
		// Match Username
		let query = {username:username};
		Users.findOne(query, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'No user found.'});
			}

			console.log(password);
			// Match Password
			bcrypt.compare(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: 'Incorrect password.'});
				}
			});
		})
	}));

	passport.serializeUser(function(user, done) {
  		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
  		Users.findById(id, function(err, user) {
    		done(err, user);
  		});
	});
}