var shell = require('shelljs');
var path = require('path');
var sim = require('../lib/svcinstall');
var fs = require('fs');

// this sample app chooses to store service information in a .services file
var SVC_NAME = 'com.sample.myserver';
var SVC_FILE_NAME = '.service';
var _cfgPath = path.join(__dirname, SVC_FILE_NAME);

// node install.js username
// if username not supplied will run as root
var action = process.argv[2];

var nodePath = shell.which('nodejs') || shell.which('node');
var scriptPath = path.join(__dirname, 'server.js');

var svcinstall = new sim.SvcInstall();

var getSvcCfg = function() {
    if (!shell.test('-f', _cfgPath)) {
        console.error('Error: not configured as a service.  use install action.');
        return null;
    }

    var svcCfg = JSON.parse(fs.readFileSync(_cfgPath).toString()); 
    return svcCfg;
}

var runAction = function(action, item) {
    svcinstall[action](item, function (err) {
        if (err) {
            console.error('Error: ' + err.message);
            return;
        }

        console.log('Success.');
    });    
}

switch (action) {
	case 'install':
            var runAsUser = process.argv[3];
            var agent = process.argv[4] === 'agent';
            var options = {
                args: [nodePath, scriptPath]
                , env: process.env
                , launchAgent: agent
            };

			if (runAsUser) {
				options.userName = runAsUser;
			}            

			svcinstall.install(SVC_NAME, options, function(err, config){
				if (err) {
					console.error('Error:', err.message);
					return;
				}

			    console.log('Writing service config to ' + SVC_FILE_NAME);
			    fs.writeFileSync(_cfgPath, JSON.stringify(config, null, 2), 'utf8');
				console.log('Installed Successfully');

				svcinstall.start(config["definition"], function(err) {
					if (err) {
						console.error('Failed to start: ', err.message);
						return;
					}

					console.log('Started Successfully');
				});
			});
		break;

	case 'uninstall':
        var svcCfg = getSvcCfg();
        if (svcCfg) {
			runAction(action, svcCfg['definition']);
			fs.unlinkSync(_cfgPath);
        }	

		break;

    case 'status':
        var svcCfg = getSvcCfg();
        if (svcCfg) {
            runAction(action, svcCfg['name']);
        }
        break;

    default:
        var svcCfg = getSvcCfg();
        if (svcCfg) {
            runAction(action, svcCfg['definition']);
        }		
}

