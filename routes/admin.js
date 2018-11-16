const express = require('express');
const multer = require('multer');
const router = express.Router();
const sizeOf = require('image-size');
var fs = require('fs');
var fileSquare;
var imageName;

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/uploads');
	},
	filename: function(req, file, cb){
		imageName = new Date().toISOString().replace(/:/g, '-') + file.originalname;
		cb(null, imageName);
	}
});

const fileFilter = (req, file, cb) => {
	// Reject a File
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
		cb(null, true);
	} else {
		req.fileValidationError = 'Invalid image format.';
		cb(null, false);
	}
}

const upload = multer({
	storage, 
	limits: {
		fileSize: 1024 * 1024
	},
	fileFilter
});

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');

// Show Admin Panel
router.get('/', function(req, res){
	// Checks if admin is logged in
	if(req.user.username == "admin"){
		res.render('admin');
	} else {
		res.render('error');
	}
});

// Add Category
router.post('/add', upload.single('categoryImage'), function(req, res){
	// Checks if the file is an appropriate format
	if(!req.fileValidationError){
		sizeOf('./public/uploads/' + imageName, function(err, dimensions){
			console.log(dimensions.width + "   " + dimensions.height);
			if(dimensions.width !== dimensions.height){
				fs.unlinkSync('./public/uploads/' + imageName);
				req.flash('error', 'Image must be a square.');
				res.redirect('/admin');
			} else {
				// Add the category
				const category = new Category({
					name: req.body.name.toLowerCase(),
					about: req.body.about,
					create_date: Date.now(),
					img: req.file.path
				});

				category.save(function(err){
					if(err){
						console.log(err);
					} else{
						req.flash('success', 'Category has been added.');
						res.redirect('/admin');
					}
				});
			}
		});
	} else {
		req.flash('error', req.fileValidationError);
		res.redirect('/admin');
	}
});

module.exports = router;