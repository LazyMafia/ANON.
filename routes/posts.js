const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

router.get('/add', function(req, res){
	res.render('addpost');
});

// Post Process
router.post('/add', function(req, res){
	Category.findOne({name: req.body.category}, function(err, category){
		if(!err){
			if(!category){
				console.log("Invalid Category");
			}
			// Find the corresponding thread
			var index;
			for(var i = 0; i < category.thread.length; i++){
				if(category.thread[i].name == req.body.thread){
					index = i;
					break;
				}
			}
			
			// Post
			category.thread[index].post.push({
				title: req.body.title,
				body: req.body.body,
				post_date: Date.now(),
				author: req.user._id
			});
	
			category.save(function(err){
				if(err){
					console.log(err);
				} else{
					res.redirect('/');
				}
			});
			
		}
	})
});

module.exports = router;