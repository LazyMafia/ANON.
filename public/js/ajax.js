// AJAX
var loading = false;
$(window).scroll(function(){ 
   if($(window).scrollTop() >= $(document).height() - $(window).height() - 10 && !loading){
		loadPosts();
	}
});

function loadPosts(){
	loading = true;
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var posts = eval('(' + this.responseText + ')');
			posts.forEach((post) => {
				var postBody = "<center><div class=\"post-content\"><div class=\"main\"><div class=\"card\"><div class=\"card-header\"><h2>" + post.title + "</h2></div><div class=\"card-body\"><p class=\"card-text\">" + post.body + "</p><p class=\"date\">" + getPostDate(post.post_date) + "</p><ul class=\"meta\"><li>" + getPostUser(post.author) + "</li></ul><a href=\"/posts/view/" + post._id + "\" class=\"btn btn-primary\">View Post</a></div></div></div></div></center>";
				$('.posts').append(postBody);
				console.log(post._id);
			});
			loading = false;
		} else if(this.status == 500){
			console.log("No More Posts");
		}
	}
	xhttp.open("GET","http://localhost:3000?ajax=true", true);
	xhttp.send();
}

function getPostDate(date){
	date = new Date(date);
	console.log(date);
	console.log(typeof(date));
	var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
	var dayEndings = ["th","st","nd","rd","th","th","th","th","th","th"] 
	var postDate = (Date.now()-Date.parse(date))/(1000*3600);
	var postDayOfMonth = date.getDate();
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
         return dayofWeek[date.getDay()] + " the " + postDayOfMonth + dayEndings[postDayOfMonth.slice(-1)];
      // Posts Within the Same Year
      } else if(now.getYear() == date.getYear()){
         return months[date.getMonth()] + " " + postDayOfMonth + dayEndings[postDayOfMonth.slice(-1)];
      } else{
      	// Posts Within 3 Months -->
         if(postDate/(24*30) <= 3){
            return months[date.getMonth()] + " " + postDayOfMonth + dayEndings[postDayOfMonth.slice(-1)] + ", " + date.getYear();
         // Posts in Another Year
         } else{
            return months[date.getMonth()] + " " + date.getYear();
         }
      }
   } 
}

function getPostUser(user){
	if(user == undefined){
		return "Posted by An Unknown User";
	} else if(user == "Anonymous") {
		return "Posted by Anonymous";
   } else{
		return "Posted by <a href=\"/users/view/" + user + "\">" + user;
	}
}