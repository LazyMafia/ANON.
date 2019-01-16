const express = require('express');
const router = express.Router();
var searchPossibilities = [];
var threadPossibilities = [];
var userPossibilities = [];
var searchResponse = [];
var userResponse = [];
var query = "";

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

router.get('/', function(req, res){
	if(req.query.ajax == 'search'){
		var str = req.query.str.toLowerCase();

		Category.find({}, function(err, categories){
			categories.forEach((category) => {
				category.thread.forEach((thread) => {
					if(~thread.name.toLowerCase().indexOf(str) || ~str.indexOf(thread.name.toLowerCase())){
						searchPossibilities.push(thread);
					}
				});
			});
		});

		User.find({}, function(err, users){
			users.forEach((user) => {
				if(~user.username.toLowerCase().indexOf(str) || ~str.indexOf(user.username.toLowerCase())){
					userPossibilities.push(user);
				}
			});
		});

		if(searchPossibilities.length > 0){
			searchPossibilities.forEach((thread) => {
				if(searchResponse.length < 3){
					searchResponse.push(thread);
				} else{
					for(var i = 0; i < 3; i++){
						if(thread.subscribers > searchResponse[i].subscribers){
							searchResponse[i] = thread;
							break;
						}
					}
				}
			});
		}

		if(userPossibilities.length > 0){
			userPossibilities.forEach((user) => {
				if(userResponse.length < 2){
					userResponse.push(user);
				} else{
					for(var i = 0; i < 2; i++){
						if(user.connected_users.followers.length > userResponse[i].connected_users.followers.length){
							userResponse[i] = user;
							break;
						}
					}
				}
			});

			searchResponse.push(...userResponse);
		}

		if(searchResponse.length > 0){
			res.send(searchResponse);
			searchPossibilities = [];
			searchResponse = [];
			userPossibilities = [];
			userResponse = [];
		} else{
			res.send("");
		}
	} else if(req.query.ajax == 'threads'){
		var a = Number(req.query.a);
		if(threadPossibilities[a + 9]){
			res.send(threadPossibilities.slice(a, a + 10));
		} else{
			res.send(threadPossibilities.slice(a, threadPossibilities.length));
		}
	} else if(req.query.ajax == 'users'){
		var a = Number(req.query.a);
		if(userPossibilities[a + 9]){
			res.send(userPossibilities.slice(a, a + 10));
		} else{
			res.send(userPossibilities.slice(a, userPossibilities.length));
		}
	} else if(req.query.ajax == 'getq'){
		res.send(query);
	}
});

router.get('/:q', function(req, res){
	threadPossibilities = [];
	userPossibilities = [];
	query = req.params.q.toLowerCase();

	Category.find({}, function(err, categories){
		categories.forEach((category) => {
			category.thread.forEach((thread) => {
				if(~thread.name.toLowerCase().indexOf(query) || ~query.indexOf(thread.name.toLowerCase())){
					threadPossibilities.push(thread);
				}
			});
		});
		threadPossibilities.sort((a, b) => (a.subscribers > b.subscribers) ? 1 : ((b.subscribers > a.subscribers) ? -1 : 0));
		res.render('search');
	});

	User.find({}, function(err, users){
		users.forEach((user) => {
			if(~user.username.toLowerCase().indexOf(query) || ~query.indexOf(user.username.toLowerCase())){
				userPossibilities.push(user);
			}
		});
		userPossibilities.sort((a, b) => (a.connected_users.followers > b.connected_users.followers) ? 1 : ((b.connected_users.followers > a.connected_users.followers) ? -1 : 0));
	});
});

module.exports = router;
