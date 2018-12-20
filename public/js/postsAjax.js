var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
var dayEndings = ["th","st","nd","rd","th","th","th","th","th","th"] 
var loading = false;
var empty = false;
var i;
var currentPost;
var lowestPost;
var highestPost;
var maxPost;
var posts;

// On Scroll
$(window).scroll(function(){
    // If User Goes to Next Post 
	if($(window).scrollTop() >= $('#' + currentPost).offset().top && !loading){
        currentPost++;
        sendCurrentPost();
    // If User Goes to Previous Post
	} else if($(window).scrollTop() <= $('#' + currentPost).offset().top && !loading && currentPost != 1){
        currentPost--;
		sendCurrentPost();
	}
    // If User Reaches Bottom of Page
	if($(window).scrollTop() >= $(document).height() - $(window).height() - 10 && !loading && !empty){
        loadPosts();
    // If User is Close to Top of the Page
	} else if($(window).scrollTop() <= 300 && !loading && lowestPost != 1){
		loadRemovedPosts();
	}
});

// On Reload
window.onload = function(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            maxPost = Number(this.response);
            if(!document.getElementById('1')){
                reload();
            }
        }
    }
    xhttp.open('GET', 'http://localhost:3000?ajax=maxpost', true);
    xhttp.send();
};

// Reload Function
function reload(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            currentPost = Number(this.response);
            if(currentPost > 3){
                loading = true;
                lowestPost = currentPost - 3;
                getPosts(currentPost - 4, currentPost + 9, () => {
                    i = lowestPost - 1;
                    posts.forEach((post) => {
                        i++;
                        // Append Post
                        var postBody = "<center id=\"" + i + "\"><div class=\"post-content\"><div class=\"main\"><div class=\"card\"><div class=\"card-header\"><h2>" + post.title + "</h2></div><div class=\"card-body\"><p class=\"card-text\">" + post.body + "</p><p class=\"date\">" + getPostDate(post.post_date) + "</p><ul class=\"meta\"><li>" + getPostUser(post.author) + "</li></ul><a href=\"/posts/view/" + post._id + "\" class=\"btn btn-primary\">View Post</a></div></div></div></div></center>";
                        $('.posts').append(postBody);
                        // If there are no more clientPosts left
                        if(maxPost == i){
                            empty = true;
                        }  
                    });
                    // Scroll back to Current Post
                    $('#' + currentPost).scrollView();
                    // Variables
                    highestPost = i
		            loading = false;
                });
            } else{
                loading = true;
                lowestPost = 1;
                getPosts(0, 9, () => {
                    i = 0;
                    posts.forEach((post) => {
                        i++;
                        // Append Post
                        var postBody = "<center id=\"" + i + "\"><div class=\"post-content\"><div class=\"main\"><div class=\"card\"><div class=\"card-header\"><h2>" + post.title + "</h2></div><div class=\"card-body\"><p class=\"card-text\">" + post.body + "</p><p class=\"date\">" + getPostDate(post.post_date) + "</p><ul class=\"meta\"><li>" + getPostUser(post.author) + "</li></ul><a href=\"/posts/view/" + post._id + "\" class=\"btn btn-primary\">View Post</a></div></div></div></div></center>";
                        $('.posts').append(postBody);
                        // If there are no more clientPosts left
                        if(maxPost == i){
                            empty = true;
                        }
                        // Variables
                        highestPost = i
                        currentPost = 1;
		                loading = false;
                    });
                });
            }
        }
    }
    xhttp.open("GET","http://localhost:3000?ajax=previous", true);
    xhttp.send();
}

// Load More Posts
function loadPosts(){
    loading = true;
    // Get 10 Posts
	getPosts(highestPost, highestPost + 9, () => {
        i = highestPost;
        posts.forEach((post) => {
            i++;
            // Append Post
            var postBody = "<center id=\"" + i + "\"><div class=\"post-content\"><div class=\"main\"><div class=\"card\"><div class=\"card-header\"><h2>" + post.title + "</h2></div><div class=\"card-body\"><p class=\"card-text\">" + post.body + "</p><p class=\"date\">" + getPostDate(post.post_date) + "</p><ul class=\"meta\"><li>" + getPostUser(post.author) + "</li></ul><a href=\"/posts/view/" + post._id + "\" class=\"btn btn-primary\">View Post</a></div></div></div></div></center>";
            $('.posts').append(postBody);
            // If there are no more clientPosts left
            if(maxPost == i){
                empty = true;
            }
        });
        // Remove Posts
		while(currentPost - lowestPost > 3){
			var post = document.getElementById(lowestPost);
	        post.parentNode.removeChild(post);
            lowestPost++;
        }
        // Scroll back to Current Post
        $('#' + currentPost).scrollView();
        // Variables
        highestPost = i
		loading = false;
	});
}

// Load Removed Posts
function loadRemovedPosts(){
    loading = true;
    // Get 10 Previous Posts
    getPosts(lowestPost - 11, lowestPost - 2, () => {
        i = lowestPost;
        // Flip the Array
        posts.reverse();
        posts.forEach((post) => {
            i--;
            // Prepend Each Post
            var postBody = "<center id=\"" + i + "\"><div class=\"post-content\"><div class=\"main\"><div class=\"card\"><div class=\"card-header\"><h2>" + post.title + "</h2></div><div class=\"card-body\"><p class=\"card-text\">" + post.body + "</p><p class=\"date\">" + getPostDate(post.post_date) + "</p><ul class=\"meta\"><li>" + getPostUser(post.author) + "</li></ul><a href=\"/posts/view/" + post._id + "\" class=\"btn btn-primary\">View Post</a></div></div></div></div></center>";
            $('posts').insertBefore(postBody, document.getElementById(lowestPost));
            console.log(lowestPost);
            lowestPost--;
        });
        // Remove Posts
        while(highestPost - currentPost > 6){
            var post = document.getElementById(highestPost);
	        post.parentNode.removeChild(post);
	        highestPost--;
        }
        // Scroll back to Current Post
        $('#' + currentPost).scrollView();
        // Variables
        lowestPost = i;
        loading = false;
    });
}

// Get Posts
function getPosts(a, b, cb){
    console.log(a);
    console.log(b);
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            posts = eval('(' + this.responseText + ')');
			cb();
		}
	}
	xhttp.open('GET', 'http://localhost:3000?ajax=getposts&a=' + a + '&b=' + b, true);
	xhttp.send();
}

// Send Current Post to Server
function sendCurrentPost(){
    var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.open('GET', 'http://localhost:3000?ajax=postpos&pos=' + currentPost, true);
	xhttp.send();
}

// Different Display of Time Based on Date
function getPostDate(date){
	date = new Date(date);
	var postDate = (Date.now()-Date.parse(date))/(1000*3600);
	var postDayOfMonth = date.getDate();
	var stringDayOfMonth = postDayOfMonth.toString().slice(-1);
	var now = new Date();

	// Posts Within 24hrs
   if(postDate < 24){ 
   	// Posts Within the Hour
      if(postDate < 1){
         // Posts Within the Minute
         if(Math.round(60/(1/postDate)) <= 1){
         	return "Just Posted";
         } else{
            return "Posted " + Math.round(60/(1/postDate)) + " Minutes Ago";
			}
      } else{
         if(Math.round(postDate) >= 2){
            return "Posted " + Math.round(postDate) + " Hours Ago";
         // Posts from an Hour Ago
         } else{ 
            return "Posted An Hour Ago";
         }
      }
   // Posts more than a Day Old-->
   } else{
      // Posts from Yesterday 
      if(date.getDay() + 1 == now.getDay() || date.getDay() - 6 == now.getDay()){
         return "Yesterday";
      // Posts Within a Week 
      } else if(now.getDate() - postDayOfMonth <= 7){ 
         return dayOfWeek[date.getDay()] + " the " + postDayOfMonth + dayEndings[stringDayOfMonth];
      // Posts Within the Same Year
      } else if(now.getYear() == date.getYear()){
         return months[date.getMonth()] + " " + postDayOfMonth + dayEndings[stringDayOfMonth];
      } else{
      	// Posts Within 3 Months -->
         if(postDate/(24*30) <= 3){
            return months[date.getMonth()] + " " + postDayOfMonth + dayEndings[stringDayOfMonth] + ", " + date.getYear();
         // Posts in Another Year
         } else{
            return months[date.getMonth()] + " " + date.getYear();
         }
      }
   } 
}

// Different Display Based on Username
function getPostUser(user){
	if(user == undefined){
		return "Posted by An Unknown User";
	} else if(user == "Anonymous") {
		return "Posted by Anonymous";
   } else{
		return "Posted by <a href=\"/users/view/" + user + "\">" + user;
	}
}

// Scroll Function
$.fn.scrollView = function(){
	return this.each(function(){
		//$('html, body').animate({
        scrollTop: $(this).offset().top - 70
		//}, 1000);
	});
}