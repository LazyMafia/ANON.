var query;
var threads = [];
var users = [];
var i = 0;
var j = 0;
// On Reload
window.onload = function(){
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      query = this.responseText;
      $('#searchHeader').text('Search Results | ' + query.capitalize());
      if(!document.getElementById('1')){
          loadResults();
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
        $('#searchResults').append(threadBody);
      });
      loadUsers();
    }
  }
  xhttp.open('GET', 'http://localhost:3000/search?ajax=threads&a=' + i, true);
  xhttp.send();
}

function loadUsers(){
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      users = JSON.parse(this.responseText);
      console.log(users);
      users.forEach((user) => {
        i++;
        j++;
        var userBody = "<center id=\"" + i + "\"><p>" + user.username + "</p></center>";
        $('#userResults').append(userBody);
      });
    }
  }
  xhttp.open('GET', 'http://localhost:3000/search?ajax=users&a=' + j, true);
  xhttp.send();
}

String.prototype.capitalize = function(){
    return this.charAt(0).toUpperCase() + this.slice(1);
}
