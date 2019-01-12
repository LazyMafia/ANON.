var query;
var threads = [];
var i = 0;
console.log("IN SCRIPT");
// On Reload
window.onload = function(){
  console.log("IN WINDOW");
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      query = this.responseText;
      $('#searchHeader').text('Search Results | ' + query);
      if(!document.getElementById('1')){
          loadResults();
          console.log("SHOULD LOAD");
      }
    }
  }
  xhttp.open('GET', 'http://localhost:3000/search?ajax=getq', true);
  xhttp.send();
}

function loadResults(){
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(this.responseText);
      threads = JSON.parse(this.responseText);
      console.log(threads);
      threads.forEach((thread) => {
        i++;
        var threadBody = "<center id=\"" + i + "\"><p>" + thread.name + "</p></center>";
        $('#searchHeader').append(threadBody);
      });
    }
  }
  xhttp.open('GET', 'http://localhost:3000/search?ajax=threads&a=' + i, true);
  xhttp.send();
}
