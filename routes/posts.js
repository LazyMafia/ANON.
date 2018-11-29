const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');
// Bring in Posts Model
let Post = require('../models/post');

router.get('/add', ensureAuthenticated, function(req, res){
	res.render('addpost');
});

// Post Process
router.post('/add', ensureAuthenticated, function(req, res){
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
					// Add post to Posts Model
					const post = new Post({
						title: req.body.title,
						body: req.body.body,
						post_date: Date.now(),
						author: req.user._id,
						category: req.body.category,
						thread: req.body.thread
					});

					post.save(function(err){
						if(err){
							console.log(err);
						} else{
							req.flash('success', 'Post has been added.');
							res.redirect('/');
						}
					});
				}
			});
			
		}
	})
});

// Edit Posts
router.get('/edit/:id', ensureAuthenticated, function(req, res){
	User.findById(req.params.id, function(err, post){
		res.render('editpost', {
			post:post
		});
	});
});

// Access Control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please login before posting.');
		res.redirect('/login');
	}
}

module.exports = router;