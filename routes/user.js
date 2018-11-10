const express = require('express');
const router = express.Router();

// Bring in User Model
let Users = require('../models/users');

// Register Form
router.get('/register', function(req, res){
	res.render('../../sign-up-page.html');
});

//module.exports = router;