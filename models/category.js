var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var categorySchema = mongoose.Schema({
	name: String,
	about: String,
	create_date: Date,
	subscribers: Number,
	img:{
		data: Buffer,
		contentType: String
	},
	thread:[{
		name: String,
		about: String,
		create_date: Date,
		creator: String,
		subscribers: Number,
		reports: Number,
		img:{
			data: Buffer,
			contentType: String
		},
		post:[{
			title: String,
			body: String,
			post_date: Date,
			author: String,
			comment:[{
				body: String,
				comment_date: Date,
				reports: Number,
				upvotes: Number,
				downvotes: Number,
				favs: Number
			}]
		}]
	}]
});

var Category = module.exports = mongoose.model('Category', categorySchema);