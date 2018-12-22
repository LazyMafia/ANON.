const express = require('express');
const router = express.Router();
var clientPosts = [];
var clientPostsRaw = [];
var empty = false;
var clientGenerationCalls = 0;
var currentPost;

// Bring in Post Model
let Post = require('../models/post');

router.get('/', function(req, res){
    if(clientPostsRaw.length < 1 && !empty){
        // Get new clientPosts
        generatePosts(() => {
            res.render('trending', {
                clientPosts:[]
            });
        });
    } else if(req.query.ajax == 'postpos'){
        currentPost = req.query.pos;
        //removedPostsB = Number(req.query.b);
        res.sendStatus(200);
    } else if(req.query.ajax == 'maxpost'){
        res.send(clientPostsRaw.length.toString());
    } else if(req.query.ajax == 'previous'){
        res.send(currentPost.toString());
    } else if(req.query.ajax == 'getposts'){
        a = Number(req.query.a);
        b = Number(req.query.b);
        if(clientPosts[b] && clientPosts[a]){
            res.send(clientPosts.slice(a, b + 1));
        } else{
            if(!empty){
                allocateClientPosts(b, () => {
                    if(clientPosts[b]){
                        res.send(clientPosts.slice(a, b + 1));
                    } else{
                        res.send(clientPosts.slice(a, clientPosts.length));
                    }
                });
            } else{
                res.send(clientPosts.slice(a, clientPosts.length));
            }
        }
    } else if(req.query.ajax == 'getremoved'){
        if(removedPostsB != 0){
            res.send(clientPosts.slice(0, removedPostsB));
        } else{
            res.sendStatus(200);
        }
    } else {
        // Re-use the clientPosts array
        res.render('trending', {
            clientPosts:[]
        });
    }
});

function generatePosts(cb){
    Post.find({}, function(err, posts){
        posts.forEach((post) => {
            if((Date.now()-Date.parse(post.post_date))/(1000*3600*24) <= 7){
                clientPostsRaw.push(post);
            }
        });
        // Sort the Array
        clientPostsRaw.sort((a,b) => (a.score/(Date.now() - Date.parse(a.post_date)) > b.score/(Date.now() - Date.parse(b.post_date))) ? 1 : ((b.score/(Date.now() - Date.parse(b.post_date)) > a.score/(Date.now() - Date.parse(a.post_date))) ? -1 : 0));
        allocateClientPosts(10, () => cb());
    });
}

function allocateClientPosts(num, cb){
    while(clientPosts.length <= num){
		if(clientPostsRaw[clientGenerationCalls]){
			clientPosts.push(clientPostsRaw[clientGenerationCalls]);
			clientGenerationCalls++;
		} else{
			empty = true;
			cb();
			break;
		}
	}
	cb();
}

module.exports = router;