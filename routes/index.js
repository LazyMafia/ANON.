const express = require('express');
const router = express.Router();
var postGenerationRequests = 0;
var trendingGenerationCalls = 0;
var interestPercentage = 45;
var userTrendingPercentage = 38;
var trendingPercentage = 65;
var userNewPercentage = 15;
var newPercentage = 30;
var posts = [];
var trendingPostsRaw = [];
var trendingPosts = [];
var trendingPostsValue = [];

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
    // DISCLAIMER: Category is being used to test instead of Post due to current inability to sign in and add new posts
    // HOW TO CHANGE TO POST:
    // - Category.find() to Post.find()
    // - post.create_date to post.post_date
    if(trendingPosts.length/postGenerationRequests - trendingGenerationCalls <= 10){
        // Find all posts
        Category.find({}, function(err, posts){
            posts.forEach(function(post){
                // Find all posts that are less than 7 days old
                if((Date.now()-Date.parse(post.create_date))/(1000*3600*24) < 7){
                    trendingPostsRaw.push(post);
                }
            });
            
            trendingPostsRaw.forEach(function(post){
                // Check if there are empty spaces in array that need to be filled
                if(trendingPosts.length/postGenerationRequests < 20){
                    trendingPosts.push(post);
                } else{
                    trendingPosts.forEach(function(existingPost){
                        // Get value of post that is in trendingPost array
                        var postValue = ((existingPost.favs*100) + existingPost.likes + existingPost.comments.length) / Date.now() - Date.parse(existingPost.create_date);
                        trendingPostsValue.push(postValue);
                    });

                    // Get value of post that is being checked
                    var postValue = ((post.favs*100) + post.likes + post.comments.length) / Date.now() - Date.parse(post.create_date);
                    var trendingPostToBeReplaced = null;
                    var i = 0;

                    trendingPosts.forEach(function(existingPost){
                        // Checks if the current post has a greater value than a post in trendingPosts
                        if(postValue > trendingPostsValue[i]){
                            // Checks if it is on the last post in the trendingPost array
                            if(i+1 < trendingPosts.length){
                                // If there is no other post that has a lesser value
                                if(trendingPostToBeReplaced == null){
                                    trendingPostToBeReplaced = i;
                                } else {
                                    // Checks if the existingPost has a lesser value than that of the one that was going to be replaced
                                    if(trendingPostsValue[i] < trendingPostToBeReplaced){
                                        trendingPostToBeReplaced = i;
                                    }
                                }
                            } else{
                                // Replaces a existingPost with the current post
                                if(trendingPostToBeReplaced == null){
                                    trendingPosts[trendingPostToBeReplaced] = post;
                                } else {
                                    if(trendingPostsValue[i] < trendingPostToBeReplaced){
                                        trendingPosts[i] = post;
                                    }
                                }
                            }
                        } 
                        i++;
                    });
                }
            });
            // Rearrange trendingPosts in order of value
            trendingPosts.sort(function(a, b){return b-a});
            // Variable Resets
            trendingPostsValue = [];
            trendingPostsRaw = [];
        });
    } else {
        // Send the trending post to posts array
        posts.push(trendingPosts[trendingGenerationCalls]);
    }
    trendingGenerationCalls++;
}

function generateNewPost(){
    console.log('New');
}

function generatePopularPost(){
    console.log('Popular');
}

module.exports = router;