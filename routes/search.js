const express = require('express');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

router.get('/', (req, res) => {
	if(req.query.ajax == 'search'){
		var str = req.query.str;
		Category.find({}, function(err, categories){
			categories.forEach((category) => {
				
			});
		});
	}
});