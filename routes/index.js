const express = require('express');
const router = express.Router();
var popularPostTimeframe = 90;
var postGenerationRequests = 0;
var interestGenerationCalls = 0;
var trendingGenerationCalls = 0;
var newGenerationCalls = 0;
var popularGenerationCalls = 0;
var interestPercentage = 45;
var userTrendingPercentage = 38;
var trendingPercentage = 65;
var userNewPercentage = 15;
var newPercentage = 30;
var clientPosts = [];
var interestPostsRaw = [];
var interestPosts = [];
var interestPostsValue = [];
var trendingPostsRaw = [];
var trendingPosts = [];
var trendingPostsValue = [];
var newPostsRaw = [];
var newPosts = [];
var newPostsValue = [];
var popularPostsRaw = [];
var popularPosts = [];
var popularPostsValue = [];

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
            clientPosts:clientPosts
        });
    } else if(welcomeContinue){
        postGenerationRequests++;
        generatePosts();
        res.render('viewpost', {
            clientPosts:clientPosts
        });
    } else {
        res.render('welcome');
    }
});

function generatePostsUser(){
    for(var i = 0; i < 15; i++){
        var rand = Math.floor(Math.random()*100) + 1;
        
        if(rand <= interestPercentage){
            // Generate a post based on user's interests
            generateInterestsPost();
        } else if(rand <= userTrendingPercentage + interestPercentage){
            // Generate a Trending post
            generateTrendingPost();
        } else if(rand <= userNewPercentage + userTrendingPercentage + interestPercentage){
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
    // Find the user
    User.findOne({username:req.user.username}, function(user){
        if(trendingPosts.length/postGenerationRequests - trendingGenerationCalls <= 10){
            // Find all posts
            Post.find({}, function(err, posts){
                posts.forEach(function(post){
                    // Find all posts that are less than 2 weeks old
                    if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) < 14){
                        var userViewedPost = false;
                        // Check if the post has already been seen by the user
                        user.viewedPosts.forEach(function(viewedPost){
                            if(viewedPost == post){
                                userViewedPost = true;
                            }
                        });
                        if(!userViewedPost){
                            interestPostsRaw.push(post);
                        }
                    }
                });
                
                var postAlreadyChosen = false;
    
                interestPostsRaw.forEach(function(post){
                    // Checks if the post has already been chosen as a trending, popular or new post
                    trendingPosts.forEach(function(trendingPost){
                        if(post != trendingPost){
                            newPosts.forEach(function(newPost){
                                if(post != newPost){
                                    popularPosts.forEach(function(popularPost){
                                        if(post == popularPost){
                                            postAlreadyChosen = true;
                                        }
                                    });
                                } else{
                                    postAlreadyChosen = true;
                                }
                            });
                        } else{
                            postAlreadyChosen = true;
                        }
                    });
    
                    if(!postAlreadyChosen){
                        // Check if there are empty spaces in array that need to be filled
                        if(interestPosts.length/postGenerationRequests < 20){
                            interestPosts.push(post);
                        } else{
                            interestPosts.forEach(function(existingPost){
                                // Find the interestValue of the post
                                var interestValue = 0;
                                user.connected_users.following.forEach(function(following){
                                    if(following == existingPost.author){
                                        interestValue = interestValue + 70;
                                    }
                                });
    
                                user.subscriptions.categories.forEach(function(category){
                                    if(category == existingPost.category){
                                        interestValue = interestValue + 20;
                                    }
                                });
    
                                user.subscriptions.threads.forEach(function(thread){
                                    if(thread == existingPost.thread){
                                        interestValue = interestValue + 10;
                                    }
                                });
                                // Get value of post that is in interestPost array
                                var postValue = ((existingPost.favs*100) + existingPost.likes + existingPost.comments.length) * (interestValue/100);
                                interestPostsValue.push(postValue);
                            });
    
                            // Find the interestValue of the post
                            var interestValue = 0;
                            user.connected_users.following.forEach(function(following){
                                if(following == post.author){
                                    interestValue = interestValue + 70;
                                }
                            });
    
                            user.subscriptions.categories.forEach(function(category){
                                if(category == post.category){
                                    interestValue = interestValue + 20;
                                }
                            });
    
                            user.subscriptions.threads.forEach(function(thread){
                                if(thread == post.thread){
                                    interestValue = interestValue + 10;
                                }
                            }); 
    
                            // Find the post value
                            var postValue = ((post.favs*100) + post.likes + post.comments.length) * (interestValue/100);
                            var interestPostToBeReplaced = null;
                            var i = 0;
    
                            interestPosts.forEach(function(existingPost){
                                // Checks if the current post has a greater value than a post in interestPosts
                                if(postValue > interestPostsValue[i]){
                                    // Checks if it is on the last post in the interestPost array
                                    if(i+1 < interestPosts.length){
                                        // If there is no other post that has a lesser value
                                        if(interestPostToBeReplaced == null){
                                            interestPostToBeReplaced = i;
                                        } else {
                                            // Checks if the existingPost has a lesser value than that of the one that was going to be replaced
                                            if(interestPostsValue[i] < interestPostToBeReplaced){
                                                interestPostToBeReplaced = i;
                                            }
                                        }
                                    } else{
                                        // Replaces a existingPost with the current post
                                        if(interestPostToBeReplaced == null){
                                            interestPosts[interestPostToBeReplaced] = post;
                                        } else {
                                            if(interestPostsValue[i] < interestPostToBeReplaced){
                                                interestPosts[i] = post;
                                            }
                                        }
                                    }
                                } 
                                i++;
                            });
                        }
                    }
                });
                // Rearrange interestPosts in order of value
                interestPosts.sort(function(a, b){return b-a});
                // Variable Resets
                interestPostsValue = [];
                interestPostsRaw = [];
            });
        } else {
            // Push the interesting post to clientPosts array
            clientPosts.push(interestPosts[interestGenerationCalls]);
        }
        interestGenerationCalls++;
    });
}

function generateTrendingPost(){
    console.log('Trending');
    if(trendingPosts.length/postGenerationRequests - trendingGenerationCalls <= 10){
        // Find all posts
        Post.find({}, function(err, posts){
            posts.forEach(function(post){
                // Find all posts that are less than 7 days old
                if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) < 7){
                    trendingPostsRaw.push(post);
                }
            });
            
            var postAlreadyChosen = false;

            trendingPostsRaw.forEach(function(post){
                // Checks if the post has already been chosen as a interesting, new or popular post
                interestPosts.forEach(function(interestPost){
                    if(post != interestPost){
                        newPosts.forEach(function(newPost){
                            if(post != newPost){
                                popularPosts.forEach(function(popularPost){
                                    if(post == popularPost){
                                        postAlreadyChosen = true;
                                    }
                                });
                            } else{
                                postAlreadyChosen = true;
                            }
                        });
                    } else{
                        postAlreadyChosen = true;
                    }
                });

                if(!postAlreadyChosen){
                    // Check if there are empty spaces in array that need to be filled
                    if(trendingPosts.length/postGenerationRequests < 20){
                        trendingPosts.push(post);
                    } else{
                        trendingPosts.forEach(function(existingPost){
                            // Get value of post that is in trendingPost array
                            var postValue = ((existingPost.favs*100) + existingPost.likes + existingPost.comments.length) / Date.now() - Date.parse(existingPost.post_date);
                            trendingPostsValue.push(postValue);
                        });

                        // Get value of post that is being checked
                        var postValue = ((post.favs*100) + post.likes + post.comments.length) / Date.now() - Date.parse(post.post_date);
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
                }
            });
            // Rearrange trendingPosts in order of value
            trendingPosts.sort(function(a, b){return b-a});
            // Variable Resets
            trendingPostsValue = [];
            trendingPostsRaw = [];
        });
    } else {
        // Push the trending post to clientPosts array
        clientPosts.push(trendingPosts[trendingGenerationCalls]);
    }
    trendingGenerationCalls++;
}

function generateNewPost(){
    console.log('New');
    if(newPosts.length/postGenerationRequests - newGenerationCalls <= 8){
        // Find all posts
        Post.find({}, function(err, posts){
            posts.forEach(function(post){
                // Find all posts that are less than 1 day old
                if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) < 1){
                    newPostsRaw.push(post);
                }
            });
            
            var postAlreadyChosen = false;

            newPostsRaw.forEach(function(post){
                // Checks if the post has already been chosen as a interesting, trending or popular post
                interestPosts.forEach(function(interestPost){
                    if(post != interestPost){
                        trendingPosts.forEach(function(trendingPost){
                            if(post != trendingPost){
                                popularPosts.forEach(function(popularPost){
                                    if(post == popularPost){
                                        postAlreadyChosen = true;
                                    }
                                });
                            } else{
                                postAlreadyChosen = true;
                            }
                        });
                    } else{
                        postAlreadyChosen = true;
                    }
                });

                if(!postAlreadyChosen){
                    // Check if there are empty spaces in array that need to be filled
                    if(newPosts.length/postGenerationRequests < 16){
                        newPosts.push(post);
                    } else{
                        newPosts.forEach(function(existingPost){
                            // Get value of post that is in newPost array
                            var postValue = (existingPost.favs*100) + existingPost.likes + existingPost.comments.length;
                            newPostsValue.push(postValue);
                        });

                        // Get value of post that is being checked
                        var postValue = (post.favs*100) + post.likes + post.comments.length;
                        var newPostToBeReplaced = null;
                        var i = 0;

                        newPosts.forEach(function(existingPost){
                            // Checks if the current post has a greater value than a post in newPosts
                            if(postValue > newPostsValue[i]){
                                // Checks if it is on the last post in the newPost array
                                if(i+1 < newPosts.length){
                                    // If there is no other post that has a lesser value
                                    if(newPostToBeReplaced == null){
                                        newPostToBeReplaced = i;
                                    } else {
                                        // Checks if the existingPost has a lesser value than that of the one that was going to be replaced
                                        if(newPostsValue[i] < newPostToBeReplaced){
                                            newPostToBeReplaced = i;
                                        }
                                    }
                                } else{
                                    // Replaces a existingPost with the current post
                                    if(newPostToBeReplaced == null){
                                        newPosts[newPostToBeReplaced] = post;
                                    } else {
                                        if(newPostsValue[i] < newPostToBeReplaced){
                                            newPosts[i] = post;
                                        }
                                    }
                                }
                            } 
                            i++;
                        });
                    }
                }
            });
            // Rearrange newPosts in order of value
            newPosts.sort(function(a, b){return b-a});
            // Variable Resets
            newPostsValue = [];
            newPostsRaw = [];
        });
    } else {
        // Push the new post to clientPosts array
        clientPosts.push(newPosts[newGenerationCalls]);
    }
    newGenerationCalls++;
}

function generatePopularPost(){
    console.log('Popular');
    if(popularPosts.length/postGenerationRequests - popularGenerationCalls <= 5){
        // Find all posts
        Post.find({}, function(err, posts){
            posts.forEach(function(post){
                // Find all posts that are within the popularPostTimeframe
                if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) < popularPostTimeframe){
                    popularPostsRaw.push(post);
                }
            });
            
            var postAlreadyChosen = false;

            popularPostsRaw.forEach(function(post){
                // Checks if the post has already been chosen as a interesting, trending or new post
                interestPosts.forEach(function(interestPost){
                    if(post != interestPost){
                        trendingPosts.forEach(function(trendingPost){
                            if(post != trendingPost){
                                newPosts.forEach(function(newPost){
                                    if(post == newPost){
                                        postAlreadyChosen = true;
                                    }
                                });
                            } else{
                                postAlreadyChosen = true;
                            }
                        });
                    } else{
                        postAlreadyChosen = true;
                    }
                });

                if(!postAlreadyChosen){
                    // Check if there are empty spaces in array that need to be filled
                    if(popularPosts.length/postGenerationRequests < 10){
                        popularPosts.push(post);
                    } else{
                        popularPosts.forEach(function(existingPost){
                            // Get value of post that is in popularPost array
                            var postValue = (existingPost.favs*100) + existingPost.likes + existingPost.comments.length;
                            popularPostsValue.push(postValue);
                        });

                        // Get value of post that is being checked
                        var postValue = (post.favs*100) + post.likes + post.comments.length;
                        var popularPostToBeReplaced = null;
                        var i = 0;

                        popularPosts.forEach(function(existingPost){
                            // Checks if the current post has a greater value than a post in popularPosts
                            if(postValue > popularPostsValue[i]){
                                // Checks if it is on the last post in the popularPost array
                                if(i+1 < popularPosts.length){
                                    // If there is no other post that has a lesser value
                                    if(popularPostToBeReplaced == null){
                                        popularPostToBeReplaced = i;
                                    } else {
                                        // Checks if the existingPost has a lesser value than that of the one that was going to be replaced
                                        if(npopularPostsValue[i] < popularPostToBeReplaced){
                                            popularPostToBeReplaced = i;
                                        }
                                    }
                                } else{
                                    // Replaces a existingPost with the current post
                                    if(popularPostToBeReplaced == null){
                                        popularPosts[popularPostToBeReplaced] = post;
                                    } else {
                                        if(popularPostsValue[i] < popularPostToBeReplaced){
                                            popularPosts[i] = post;
                                        }
                                    }
                                }
                            } 
                            i++;
                        });
                    }
                }
            });
            // Rearrange popularPosts in order of value
            popularPosts.sort(function(a, b){return b-a});
            // Variable Resets
            popularPostsValue = [];
            popularPostsRaw = [];
        });
    } else {
        // Push the popular post to clientPosts array
        clientPosts.push(popularPosts[popularGenerationCalls]);
    }
    popularGenerationCalls++;
}

module.exports = router;