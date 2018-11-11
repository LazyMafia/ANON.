const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// Connect to Mongoose
mongoose.connect(config.database);
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

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Home Route
app.get('/', function(req, res){
	res.render('index');
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

// Support Route
app.get('/support', function(req, res){
	res.render('support');
});

// Register Routes
let register = require('./routes/register');
app.use('/register', register);

// Login Routes
let login = require('./routes/login');
app.use('/login', login);

// 404 Route
app.get('*', function(req, res){
	res.render('error');
});

app.listen(3000);
console.log("Running on port 3000");