const express = require('express');
const router = express.Router();
var searchPossibilities = [];
var searchResponse = [];

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
					if(~thread.name.toLowerCase().indexOf(str)){
						console.log(thread.name);
						searchPossibilities.push(thread);
					} else if(~str.indexOf(thread.name.toLowerCase())){
						console.log(thread.name);
						searchPossibilities.push(thread);
					}
				});
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
			res.send(searchResponse);
			searchPossibilities = [];
			searchResponse = [];
		} else{
			res.send("");
		}
	}
});

module.exports = router;
