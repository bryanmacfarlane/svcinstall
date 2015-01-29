var shell = require('shelljs');
var path = require('path');
var sim = require('../lib/svcinstall');

// node install.js username
// if username not supplied will run as root
var user = process.argv[2];

var nodePath = shell.which('nodejs') || shell.which('node');
var scriptPath = path.join(__dirname, 'server.js');

var options = { 
		args: [nodePath, scriptPath],
		workingDirectory: path.dirname(scriptPath),
		userName: process.env.USER,
		env: { "ENV_VAR1": "Value 1", "ENV_VAR2": "Value 2",}
	};


if (user) {
	options.userName = user;
}

var svcinstall = new sim.SvcInstall('myserver', 'com.sample');
svcinstall.install(options, function(err){
	if (err) {
		console.error('Error:', err.message);
		return;
	}

	console.log('Installed Successfully');

	svcinstall.start(function(err) {
		if (err) {
			console.error('Failed to start: ', err.message);
			return;
		}

		console.log('Started Successfully');
	});
});