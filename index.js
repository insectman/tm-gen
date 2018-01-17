var http = require('http'); //add the http module
var fs = require('fs'); //add the http module

var spriteFile;
var cssFile;

const filesMap = new Map();

['./images/awAchSprite.png',
  './images/board.jpg',
  './images/oceanTile.png',
  './images/resSprite.png',
  './main.js',
  './favicon.ico',
  './board.html',
  './index.html',
  './styles/main.css'].forEach(fileName =>
    fs.readFile(fileName, function (err, data) {
      if (err) {
        throw err;
      }
      filesMap.set(fileName, data);
    }));

var myServer = http.createServer(function (request, response) {
  var awards, achievements;

  let source = filesMap.get(`.${request.url}`);

  switch (request.url) {
    case "/main.js":
    response.writeHead(200, { "Content-Type": "application/javascript" });
      break;
    case "/styles/main.css":
      response.writeHead(200, { "Content-Type": "text/css" });
      break;
    case "/images/board.jpg":
    case "/images/awAchSprite.png":
    case "/images/resSprite.png":
    case "/images/oceanTile.png":
      if (!response.getHeader('Cache-Control') || !response.getHeader('Expires')) {
        response.setHeader("Cache-Control", "public, max-age=345600"); // ex. 4 days in seconds.
        response.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());  // in ms.
      }
      if(request.url == "/images/board.jpg") {
        response.writeHead(200, { "Content-Type": "image/jpeg" });
      }
      else {
        response.writeHead(200, { "Content-Type": "image/png" });
      }
      break;
    case '/favicon.ico':
      response.writeHead(200, { "Content-Type": "image/x-icon" });
      break;
    case '/board':
      response.writeHead(200, { "Content-Type": "text/html" });
      source = filesMap.get('./board.html');
      break;
    default:
      response.writeHead(200, { "Content-Type": "text/html" });
      source = filesMap.get('./index.html');
  };
  
  response.end(source);
});

var port = process.env.PORT || 3000

myServer.listen(port);