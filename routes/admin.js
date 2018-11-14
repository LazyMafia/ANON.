const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/uploads');
	},
	filename: function(req, file, cb){
		cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
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
		fileSize: 1024 * 1024 * 5
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
	} else {
		req.flash('error', req.fileValidationError);
		res.redirect('/admin');
	}
});

module.exports = router;