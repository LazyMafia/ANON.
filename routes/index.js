const express = require('express');
const router = express.Router();
var interestPercentage = 45;
var userTrendingPercentage = 38;
var trendingPercentage = 65;
var userNewPercentage = 15;
var newPercentage = 30;
var posts = [];
var trendingPosts = [];

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');
// Bring in Post Model
let Post = require('../models/post');

router.get('/', function(req, res){
    if(req.user != null){
        generatePostsUser();
        res.render('viewpost', {
            posts:posts
        });
    } else if(welcomeContinue){
        generatePosts();
        res.render('viewpost', {
            posts:posts
        });
    } else {
        res.render('welcome');
    }
});

function generatePostsUser(){
    for(var i = 0; i < 15; i++){
        var rand = Math.floor(Math.random()*100) + 1;
        
        if(rand <= userInterestPercentage){
            // Generate a post based on user's interests
            generateInterestsPost();
        } else if(rand <= userTrendingPercentage + userInterestPercentage){
            // Generate a Trending post
            generateTrendingPost();
        } else if(rand <= userNewPercentage + userTrendingPercentage + userInterestPercentage){
            // Generate a New post
            generateNewPost();
        } else{ 
            // Generate a Popular Post
            generatePopularPost();
        }
    }
}

function generatePosts(){
    for(var i = 0; i < 15; i++){
        var rand = Math.floor(Math.random()*100) + 1;
        if(rand <= trendingPercentage){
            // Generate a Trending post
            generateTrendingPost();
        } else if(rand <= newPercentage + trendingPercentage){
            // Generate a New post
            generateNewPost();
        } else{
            // Generate a Popular post
            generatePopularPost();
        }
    }
}

function generateInterestsPost(){
    console.log(req.user);
}

function generateTrendingPost(){
    console.log('Trending');
    for(var i = 0; i < 15; i++){
        Post.findOne({}, function(err, post){
            
        });
    }
}

function generateNewPost(){
    console.log('New');
}

function generatePopularPost(){
    console.log('Popular');
}

module.exports = router;