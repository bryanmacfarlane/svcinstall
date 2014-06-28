var shell = require('shelljs');
var path = require('path');
var sim = require('../lib/svcinstall');

var nodePath = shell.which('nodejs') || shell.which('node');
var scriptPath = path.join(__dirname, 'server.js');

var options = { 
		args: [nodePath, scriptPath],
		workingDirectory: path.dirname(scriptPath)
	};

var svcinstall = new sim.SvcInstall('com.sample', 'myserver');
svcinstall.install(options, function(err){
	if (err) {
		console.error('Error:', err.message);
		return;
	}

	console.log('Installed Successfully');

	svcinstall.start(function(err) {
		if (err) {
			console.error('Failed to start: ', err);
		}

		console.log('Started Successfully');
	});
});