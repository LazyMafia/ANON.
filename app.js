const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// Socket.IO
const port = process.env.PORT || 3000;
const server = app.listen(port, function(){
	console.log('Running on port: ' + port);
});
const io = require('socket.io').listen(server);
var welcomeContinue = false;

io.on('connection', function(socket){
	socket.on('welcomeContinue', function(){
		welcomeContinue = true;
	});

	socket.on('disconnect', function(){
		welcomeContinue = false;
	});
})

// Connect to Mongoose
mongoose.connect(config.database);
var db = mongoose.connection;

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

// Models
User = require('./models/user');

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

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});

app.post('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Home Route
app.get('/', function(req, res){
	if(req.user != null || welcomeContinue){
		res.render('index');
	} else {
		res.render('welcome');
	}
});

// Comments Route
app.get('/comments', function(req, res){
	User.getUserComments(function(err, comments){
		if(err){
			throw err;
		}
		for(i = 0; i < comments[1].user_comments.length; i++){
			res.send(i + 1 + ". " + comments[1].user_comments[i].body);
		}
	})
});

// Welcome Route
app.get('/welcome', function(req, res){
	welcomeContinue = false;
	res.redirect('/');
});

// Support Route
app.get('/support', function(req, res){
	res.render('support');
});

// Post Route
let posts = require('./routes/posts');
app.use('/posts', posts);

// Settings Route
let settings = require('./routes/settings');
app.use('/settings', settings);

// Admin Route
let admin = require('./routes/admin');
app.use('/admin', admin);

// Logout Route
app.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have been logged out.');
	res.redirect('/login');
});

// Register Routes
let register = require('./routes/register');
app.use('/register', register);

// Login Routes
let login = require('./routes/login');
app.use('/login', login);

// Category Route
let category = require('./routes/category');
app.use('/category', category);

// 404 Route
app.get('*', function(req, res){
	res.render('error');
});
