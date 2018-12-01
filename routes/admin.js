const express = require('express');
const multer = require('multer');
const router = express.Router();
const sizeOf = require('image-size');
const fs = require('fs');
const jimp = require('jimp');
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
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/svg'){
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
	if(req.user){
		if(req.user.username == "admin"){
			res.render('admin');
		}
	} else {
		res.render('error');
	}
});

// Add Category
router.post('/add', upload.single('categoryImage'), function(req, res){
	// Checks if the file is an appropriate format
	if(!req.fileValidationError){
		sizeOf('./public/uploads/' + imageName, function(err, dimensions){
			// Checks if image is a square
			if(dimensions.width !== dimensions.height){
				fs.unlinkSync('./public/uploads/' + imageName);
				req.flash('error', 'Image must be a square.');
				res.redirect('/admin');
			// Checks if image size is greater than 249 pixels
			} else if(dimensions.width < 250){
				fs.unlinkSync('./public/uploads/' + imageName);
				req.flash('error', 'Image must be at least 250 by 250 pixels.');
				res.redirect('/admin');
			// Checks if Name or About parameters are missing
			} else if(req.body.name.split(' ').join('') == "" || req.body.about.split(' ').join('') == ""){
				fs.unlinkSync('./public/uploads/' + imageName);
				req.flash('error', '"Name" or "About" Parameters Missing');
				res.redirect('/admin');
			// No Errors
			} else {
				// Resize Image
				// jimp.read('./public/uploads/' + imageName, function(err, img){
				// 	if(err){
				// 		console.log(err)
				// 	}
				// 	img.resize(250, 250).write('./public/uploads/' + imageName.slice(0, imageName.lastIndexOf('.')) + '.png', function(){
				// 		fs.unlinkSync('./public/uploads/' + imageName);
				// 	});
				// });

				const category = new Category({
					name: req.body.name.toLowerCase(),
					about: req.body.about,
					create_date: Date.now(),
					img: './public/uploads/' + imageName
					//'public\\uploads\\' + imageName.slice(0, imageName.lastIndexOf('.')) + '.png'
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