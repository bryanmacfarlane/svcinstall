//
// svcsample.js
// Full sample that supports install, start and stop
//
// sudo node svcsample
//
var path = require('path') 
  , sim = require('../lib/svcinstall')
  , shelljs = require('shelljs');

// on OSX (Darwin), a launchd daemon will get installed as: com.sample.myserver
// on Linux, a start-stop-daemon will get installed as: myserver

var svcinstall = new sim.SvcInstall('myserver', 'com.sample');

var action = process.argv[2];

var showUsage = function(code) {
	console.log('usage: node svcmgr [action]');
	console.log('\taction=install, start, stop');
	process.exit(code);	
}

if (!action || action === '-?') {
	showUsage(action ? 0 : 1);
}

if (typeof svcinstall[action] !== 'function') {
	showUsage(1);
}

// node is known as nodejs on some *nix installs
var nodePath = shelljs.which('nodejs') || shelljs.which('node');

switch (action) {
	case 'install':
		var scriptPath = path.join(__dirname, 'server.js');
		var options = { 
				args: [nodePath, scriptPath, '1338'],
				workingDirectory: path.dirname(scriptPath)
			};

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
		break;
	default:
		svcinstall[action](function(err) {
			if (err) {
				console.error('Error: ', err);
				return;
			}

			console.log(action + ': Success.');			
		});
}


//
// After Install, to validate:
//
// OSX (Darwin):
// --------------
// launchctl list | grep com.sample
