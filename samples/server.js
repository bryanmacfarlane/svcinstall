
var http = require('http');
http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  }

  console.log('request processed');
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1338, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1338/');
