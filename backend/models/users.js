var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// Users Schema
var usersSchema = mongoose.Schema({
	username:{
		type: String
	},
	email:{
		type: String,
		required: true
	},
	password:{
		type: String,
		required: true
	},
	about:{
		type: String
	},
	date:{
		type: Date,
		default: Date.now
	},
	verified:{
		type: Boolean
	},
	profile_image:{
		data: Buffer,
		contentType: String,
		date_uploaded: Date
	},
	meta:{
		upvotes: Number,
		downvotes: Number,
		favs: Number,
		score: Number,
		reports_received: Number,
		reports_sent: Number,
	},
	reports_sent:[{
		user_id: ObjectId,
		item_id: ObjectId,
		reason: String,
		report_date: Date
	}],
	reports_received:[{
		user_id: ObjectId,
		item_id: ObjectId,
		reason: String,
		report_date: Date
	}],
	user_comments:[{
		body: String,
		comment_date: Date,
		parent: ObjectId,
		reports: Number,
		upvotes: Number,
		downvotes: Number,
		favs: Number,
		parent_comment:{
			body: String,
			comment_date: Date,
			upvotes: Number,
			downvotes: Number,
			favs: Number,		 
		}
	}],
	user_posts:[{
		thread: String,
		public: Boolean,
		body: String,
		reports: Number,
		upvotes: Number,
		downvotes: Number,
		favs: Number,
		img:{
			data: Buffer,
			contentType: String
		}
	}],
	bookmarks:[{
		object_type: Number,
		upload_date: Date,
		thread: String,
		subscribers: Number,
		text: String,
		upvotes: Number,
		downvotes: Number,
		favs: Number,
		img:{
			data: Buffer,
			contentType: String
		}
	}],
	images:[{
		img:{
			data: Buffer,
			contentType: String
		},
		upload_date: Date,
		text: String,
		parent: ObjectId,
		upvotes: Number,
		downvotes: Number,
		favs: Number,
		reports: Number
	}],
	settings:{
		privacy:{
			username: Boolean,
			email: Boolean,
			date_joined: Boolean,
			about: Boolean,
			activity:{
				comments: Boolean,
				upvotes: Boolean,
				downvotes: Boolean,
				favs: Boolean
			}
		},
		theme:{
			type: String
		},
		notifications:{
			email:{
				replies: Boolean,
				follow: Boolean,
				upvotes: Boolean,
				downvotes: Boolean,
				favs: Boolean,
				friend_request: Boolean,
				friend_accept: Boolean
			},
			web:{
				replies: Boolean,
				follow: Boolean,
				friend_request: Boolean,
				friend_accept: Boolean,
				upvotes: Boolean,
				downvotes: Boolean,
				favs: Boolean
			}
		}
	},
	connected_users:{
		following:[{
			user_id: ObjectId,
			username: String,
			profile_image:{
				data: Buffer,
				contentType: String
			}
		}],
		followers:[{
			user_id: ObjectId,
			username: String,
			profile_image:{
				data: Buffer,
				contentType: String
			}
		}],
		friends:[{
			user_id: ObjectId,
			username: String,
			profile_image:{
				data: Buffer,
				contentType: String
			}
		}],
		friends_sent:[{
			user_id: ObjectId,
			username: String,
			profile_image:{
				data: Buffer,
				contentType: String
			}
		}],
		friends_received:[{
			user_id: ObjectId,
			username: String,
			profile_image:{
				data: Buffer,
				contentType: String
			}
		}]
	},
	notifications:[{
		text: String,
		link: String,
		img:{
			data: Buffer,
			contentType: String
		}
	}]
});

var Users = module.exports = mongoose.model('Users', usersSchema);

// Get user comments
module.exports.getUserComments = function(callback, limit){
	Users.find(callback).limit(limit);
}