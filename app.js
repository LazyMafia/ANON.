var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

Users = require('./models/users');

app.use(express.static("public"));

app.use(express.static(__dirname + '/public'));

// Connect to Mongoose
mongoose.connect('mongodb://localhost/anondb');
var db = mongoose.connection;

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Home Route
app.get('/', function(req, res){
	res.send('Go to welcome page');
});

app.get('/register', function(req, res){
	res.render("register");
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