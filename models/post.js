var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var postSchema = mongoose.Schema({
    title: String,
    body: String,
    post_date: Date,
    author: String,
    reports: Number,
    upvotes: Number,
    downvotes: Number,
    favs: Number,
    score: Number,
    thread: String,
    category: String,
    comment:[{
        body: String,
        comment_date: Date,
        reports: Number,
        upvotes: Number,
        downvotes: Number,
        favs: Number
    }]
});

var Post = module.exports = mongoose.model('Post', postSchema);