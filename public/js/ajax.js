// AJAX
$(window).scroll(function(){ 
   if($(window).scrollTop() >= $(document).height() - $(window).height() - 10){
      loadPosts();
   }
});

function loadPosts(){
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			console.log(this.responseText.length);
		}
	}
	xhttp.open("GET","http://localhost:3000?ajax=true", true);
	xhttp.send();
}