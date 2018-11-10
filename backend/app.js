var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

Users = require('./models/users');

// Connect to Mongoose
mongoose.connect('mongodb://localhost/anondb');
var db = mongoose.connection;

app.get('/', function(req, res){
	res.send('Go to welcome page');
});

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

app.listen(3000);
console.log("Running on port 3000");