const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

// Show Category
router.get('/:category', function(req, res){
	Category.findOne({name: req.params.category.toLowerCase()}, function(err, category){
		res.render('category', {
			category:category
		});
	});
});

// Show Threads
router.get('/:thread', function(req, res){
	Category.thread.findOne({name: req.params.thread}, function(err, thread){
		res.render('thread', {
			thread:thread
		});
	});
});

module.exports = router;