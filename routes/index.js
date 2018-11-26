const express = require('express');
const router = express.Router();
var postGenerationRequests = 0;
var interestPercentage = 45;
var userTrendingPercentage = 38;
var trendingPercentage = 65;
var userNewPercentage = 15;
var newPercentage = 30;
var posts = [];
var trendingPostsRaw = [];
var trendingPosts = [];

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');
// Bring in Post Model
let Post = require('../models/post');

router.get('/', function(req, res){
    if(req.user != null){
        postGenerationRequests++;
        generatePostsUser();
        res.render('viewpost', {
            posts:posts
        });
    } else if(welcomeContinue){
        postGenerationRequests++;
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
    Category.find({}, function(err, posts){
        posts.forEach(function(post){
            // Find all posts that are less than 7 days old
            if((Date.now()-Date.parse(post.create_date))/(1000*3600*24) < 7){
                trendingPostsRaw.push(post);
            } else{
                console.log("More than 7 days old");
            }
        });

        trendingPostsRaw.forEach(function(post){
            if(trendingPosts.length/postGenerationRequests < 15){
                trendingPosts.push(post);
            } else{

            }
        });
    });
}

function generateNewPost(){
    console.log('New');
}

function generatePopularPost(){
    console.log('Popular');
}

module.exports = router;