const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

// Connect to Mongoose
mongoose.connect('mongodb://localhost/anondb');
var db = mongoose.connection;

// Init App
var app = express();

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

// Models
Users = require('./models/users');

// Set Public Folder
app.use(express.static("public"));

// Express Session Middleware
app.use(session({
  secret: 'a4_QL0f+2mI?vN3',
  resave: true,
  saveUninitialized: true,
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'), root = namespace.shift(), formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param:formParam,
			msg:msg,
			value:value
		};
	}
}));

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Home Route
app.get('/', function(req, res){
	res.send('Go to welcome page');
});

// Register Route
app.get('/register', function(req, res){
	res.render("register");
});

app.post('/registerUser', function(req, res){
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

// Login Route
app.get('/login', function(req, res){
	res.render('login');
});

// Comments Route
app.get('/comments', function(req, res){
	Users.getUserComments(function(err, comments){
		if(err){
			throw err;
		}
		for(i = 0; i < comments[1].user_comments.length; i++){
			res.send(i + 1 + ". " + comments[1].user_comments[i].body);
		}
	})
});

//let user = require('./routes/user');
//app.use('/user', user);

app.listen(3000);
console.log("Running on port 3000");