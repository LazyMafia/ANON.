const express = require('express');
const router = express.Router();
var popularPostTimeframe = 90;
var postGenerationRequests = 0;
var interestGenerationCalls = 0;
var trendingGenerationCalls = 0;
var newGenerationCalls = 0;
var popularGenerationCalls = 0;
var clientGenerationCalls = 0;
var extraGenerationCalls = 0;
var interestPercentage = 45;
var userTrendingPercentage = 38;
var trendingPercentage = 65;
var userNewPercentage = 15;
var newPercentage = 30;
var clientPosts = [];
var interestPosts = [];
var trendingPosts = [];
var newPosts = [];
var popularPosts = [];
var clientPostsRaw = [];
var userObj;
var callbackNum = 0;
var generateMore = false;

// Bring in User Model
let User = require('../models/user');
// Bring in Category Model
let Category = require('../models/category');
// Bring in Post Model
let Post = require('../models/post');

router.get('/', function(req, res){
    userObj = req.user;
    if(req.user || welcomeContinue){
	    if(clientPosts.length < 1 || generateMore){
	    	// Get new clientPosts
	        postGenerationRequests++;
	        generatePosts(() => {
	            res.render('overview', {
	                clientPosts:clientPosts
	            });
	        });
	    } else {
	    	// Re-use the clientPosts array
	        res.render('overview', {
	            clientPosts:clientPosts
	        });
	    } 
	} else {
    	res.render('welcome');
    }
});

function generatePosts(cb){
	if(clientPostsRaw.length - postGenerationRequests*10 >= 0){
		allocateClientPosts(() => cb());
	} else{
		Post.find({}, function(err, posts){
			if(trendingPosts.length > 0){
				while(clientPostsRaw.length - postGenerationRequests*10 < 0 && extraPosts.length - extraGenerationCalls > 0){
					clientPostsRaw.push(extraPosts[extraGenerationCalls]);
					extraGenerationCalls++;
				}
				allocateClientPosts(() => cb());
			} else{
				if(userObj){
					// User Logged In
					posts.forEach(function(post){
						if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= popularPostTimeframe){
							if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= 14){
								if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= 7){
									if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= 1){
										if(trendingPosts.length >= posts.length*0.38){
											if(interestPosts.length >= posts.length*0.45){
												newNewPost(post);
											} else{
												// Interest or New Post
												if(newPosts.length >= posts.length*0.2){
													// If there are enough newPosts
													newInterestPost(post);
												} else{
													interestOrNew(post);
												}	
											}
										} else{
											// Trending, Interest, or New Post
											if(newPosts.length >= posts.length*0.2){
												// If there are enough newPosts
												interestOrTrending(post);
											} else if(interestPosts.length >= posts.length*0.45){
												trendingOrNew(post);
											} else{
												TNI(post);
											}
										}
									} else{
										if(interestPosts.length >= posts.length*0.45){
											if(popularPosts.length >= posts.length*0.02){
												// If there are enough interestPosts and popularPosts
												newTrendingPost(post);
											} else if(trendingPosts.length >= posts.length*0.4){
												// If there are enough trendingPosts
												newPopularPost(post);
											} else{
												trendingOrPopular(post);
											}
										} else if(popularPosts.length >= posts.length*0.02){
											if(trendingPosts.length >= posts.length*0.4){
												// If there are enough trendingPosts
												newInterestPost(post);
											} else{
												interestOrTrending(post);
											}
										} else if(trendingPosts.length >= posts.length*0.4){
											popularOrInterest(post);
										} else{
											TPI(post);
										}
									}
								} else{
									// Interest or Popular Post
									if(popularPosts.length >= posts.length*0.02){
										// If there are enough popularPosts
										newInterestPost(post);
									} else if(interestPosts.length >= posts.length *0.5){
										// If there are enough interestPosts
										newPopularPost(post);
									} else{
										popularOrInterest(post);
									}
								}
							} else{
								newPopularPost(post);
							}
						} else{
							newExtraPost(post);
						}
					});
				} else{
					// No User
					posts.forEach(function(post){
						if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= popularPostTimeframe){
							if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= 7){
								if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= 1){
									if(trendingPosts.length >= posts.length*0.65){
										newNewPost(post);
									} else if(newPosts.length >= posts.length*0.3){
										newTrendingPost(post);
									} else{
										trendingOrNew(post);
									}
								} else{
									if(popularPosts.length >= posts.length*0.05){
										newTrendingPost(post);
									} else if(trendingPosts.length >= posts.length*0.65){
										newPopularPost(post);
									} else{
										trendingOrPopular(post);
									}
								}
							} else{
								newPopularPost(post);
							}
						} else{
							newExtraPost(post);
						}
					});
				}

				// Sort Arrays
				extraPosts.sort((a,b) => (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0));
				popularPosts.sort((a,b) => (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0));
				interestPosts.sort((a,b) => (getInterestValue(a) > getInterestValue(b)) ? 1 : ((getInterestValue(b) > getInterestValue(a)) ? -1 : 0));
				trendingPosts.sort((a,b) => (a.score/(Date.now() - Date.parse(a.post_date)) > b.score/(Date.now() - Date.parse(b.post_date))) ? 1 : ((b.score/(Date.now() - Date.parse(b.post_date)) > a.score/(Date.now() - Date.parse(a.post_date))) ? -1 : 0));
				newPosts.sort((a,b) => (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0));

				// Generate 30 new clientPosts
				for(var i = 0; i < 30; i++){
					var rand = Math.floor(Math.random()*100) + 1;

					if(userObj && rand <= interestPercentage){
						// Generate a post based on user's interests
						clientPostsRaw.push(interestPosts[interestGenerationCalls]);
						interestGenerationCalls++;
					} else if(userObj && rand <= interestPercentage + userTrendingPercentage || rand <= trendingPercentage){
						// Generate a trending post
						clientPostsRaw.push(trendingPosts[trendingGenerationCalls]);
						trendingGenerationCalls++;
					} else if(userObj && rand <= interestPercentage + userTrendingPercentage + userNewPercentage || rand <= trendingPercentage + newPercentage){
						// Generate a new post
						clientPostsRaw.push(newPosts[newGenerationCalls]);
						newGenerationCalls++;
					} else{
						// Generate a popular post
						clientPostsRaw.push(popularPosts[popularGenerationCalls]);
						popularGenerationCalls++;
					}
				}

				allocateClientPosts(() => cb())
			}
		});
	}
}

function getInterestValue(post){
	// Find the interestValue of the post
    var interestValue = 0;
    // Checks if user is following the author
    userObj.connected_users.following.forEach(function(following){
    	// Checks if user is friends with the author
    	if(following.user == post.authorID){
    		interestValue = interestValue + 50;
    		userObj.connected_users.friends.forEach(function(friend){
    			if(friend.user == post.authorID){
    				interestValue = interestValue + 35;
    			}
    		});
    	}
    });

    // Checks if user is subscribed to the thread
    userObj.subscriptions.threads.forEach(function(thread){
        if(thread == post.thread){
            interestValue = interestValue + 10;
        }
    });

    // Checks if user is subscribed to the category
    userObj.subscriptions.categories.forEach(function(category){
        if(category == post.category){
            interestValue = interestValue + 5;
        }
    });

    // Return the value of the post
    return post.score * (interestValue/100);
}

function newPopularPost(post){
	popularPosts.push(post);
}

function newExtraPost(post){
	extraPosts.push(post);
}

function newInterestPost(post){
	interestPosts.push(post);
}

function newTrendingPost(post){
	trendingPosts.push(post);
}

function newNewPost(post){
	newPosts.push(post);
}

function popularOrInterest(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 96){
		newInterestPost(post);
	} else{
		newPopularPost(post);
	}
}

function interestOrTrending(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 50){
		newTrendingPost(post);
	} else{
		newInterestPost(post);
	}
}

function interestOrNew(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 60){
		newInterestPost(post);
	} else{
		newNewPost(post);
	}
}

function trendingOrPopular(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 95){
		newTrendingPost(post);
	} else{
		newPopularPost(post);
	}
}

function trendingOrNew(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 70){
		newTrendingPost(post);
	} else{
		newNewPost(post);
	}
}

function TPI(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 58){
		newTrendingPost(post);
	} else if(rand <= 98){
		newInterestPost(post);
	} else{
		newPopularPost(post);
	}
}

function TNI(post){
	var rand = Math.floor(Math.random()*100) + 1;

	if(rand <= 40){
		newTrendingPost(post);
	} else if(rand <= 80){
		newInterestPost(post);
	} else{
		newNewPost(post);
	}
}

function allocateClientPosts(cb){
	while(clientPosts.length < postGenerationRequests*10){
		clientPosts.push(clientPostsRaw[clientGenerationCalls]);
		clientGenerationCalls++;
	}
	cb();
}

module.exports = router;