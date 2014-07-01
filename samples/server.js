
var http = require('http');
http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  }

  console.log('request processed');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.write('Sample Server<br>');
  res.write('Env Vars<br>');
  for (key in process.env) {
  	res.write(key + "=" + process.env[key] + "<br>");
  }
  res.end("</body></html>");
}).listen(1338, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1338/');
