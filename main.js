var http = require('http'); //add the http module
var fs = require('fs'); //add the http module

var spriteFile;
var cssFile;

fs.readFile('./images/awAchSprite.jpg', function(err, data) {
    if (err){
        throw err;
    }
    spriteFile = data;
});

fs.readFile('./styles/main.css', function(err, data) {
  if (err){
      throw err;
  }
  cssFile = data;
});

//Create a server
var myServer = http.createServer(function (request, response) {
  // Return something from server

  switch (request.url) {
    case "/styles/main.css" :
        response.writeHead(200, {"Content-Type": "text/css"});
        response.end(cssFile);
        break;
    case "/images/awAchSprite.jpg" :
        response.writeHead(200, {"Content-Type": "image/jpeg"});
        response.end(spriteFile);
        break;
    default :    
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write('<link rel="stylesheet" type="text/css" href="/styles/main.css">');
        const {awards, achievements, allAwards, allAchievements} = genRandBoard();
        response.write('<div class = "container">');
        if(!false) {
          awards.forEach(aw =>
            response.write(`<div class = "icon icon-${aw}"></div>`));
            response.write('</div><div class = "container">');
          achievements.forEach(ach =>
            response.write(`<div class = "icon icon-${ach}"></div>`));
        }
        response.write('</div>');
        if(false) {
          response.write('<br>');
          response.write(`${allAwards+""}`)
          response.write('<br>');
          response.write(`${allAchievements+""}`) 
        }
        response.end();
  };
}); //create a server

Array.prototype.getnkill = function() {
  var a = Math.floor(Math.random()*this.length);
  var dead = this[a];
  this.splice(a,1);
  return dead;
}

function genRandBoard() {
 let allAchievements = Array.from({length: 16}, (x,i) => i);
 allAchievements.splice(12,1);
 let allAwards = Array.from({length: 12}, (x,i) => i+16);
 allAwards.unshift(12);
 allAwards.push(30);
 allAwards.push(31);

 const awards = [];
 const achievements = [];
 for(let i = 0; i < 5; i++) {
  awards.push(allAwards.getnkill());
  achievements.push(allAchievements.getnkill());
 }
 return {awards, achievements, allAwards, allAchievements};
}

myServer.listen(3000);