const express = require('express');
const router = express.Router();

// Bring in User Model
let Users = require('../models/users');

// Register Form
router.get('user/register', function(req, res){
	res.render('register');
});

module.exports = router;