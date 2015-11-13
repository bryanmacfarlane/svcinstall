//
// Creates a Darwin (OSX) Launchd plist for automating running as a Daemon
// References: 
//             https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/launchctl.1.html
//             https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
//             https://developer.apple.com/library/mac/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html
//
// LaunchAgent: autologin + lock screen:
//             http://www.tuaw.com/2011/03/07/terminally-geeky-use-automatic-login-more-securely/
//

var plist = require('plist');
var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

var checkRoot = function(callback) {
	if (process.getuid() > 0) {
		callback(new Error('Must be run as root (use sudo)'));
		return false;
	}

	return true;
}

var launchctl = function(command, callback) {
	cp.exec('launchctl ' + command, function(err, stdout, stderr) {
		if (err) {
			callback(err);
			return;
		}

		if (stdout) {
			console.log(stdout);
		}

		if (stderr) {
			console.error(stderr);
			return;
		}

		callback();
	});
}

exports.start = function(path, callback) {
	launchctl('load -w ' + path, callback);
}

exports.stop = function(path, callback) {
	launchctl('unload ' + path, callback);
}

exports.uninstall = function(path, callback) {
	launchctl('remove ' + path, function(err) {
		shell.rm(path);
	});
}

exports.status = function(name, callback) {
	launchctl('list | grep ' + name, callback);
}

//
// Options: 
//  program - path to program or script to run 
//  user - user to run as.  defaults to root
//  args - array of args passed to script
//
// callback(err, config)
//
exports.install = function(name, options, callback) {
	console.log('Installing Service: ' + name);

	options = options || {};

	// the resultant config given back to caller so they can store if they want
	var config = {};
	config.name = name;

	var plistData = {};
	plistData["Label"] = name;
	plistData["ProgramArguments"] = options.args;
	
	var launchAgent = options.launchAgent && options.launchAgent == true;

	var runAsUser = options.userName;
	if (runAsUser) {
		plistData["UserName"] = config["runAsUser"] = options.userName;
	}

	if (!runAsUser && !checkRoot(callback)) {
		return;
	}

	if (options.sessionCreate) {
		plistData['SessionCreate'] = true;
	}

	//
	// If run as user, default to being a launch agent.  If not (run as root), default to running as daemon
	// Same for logging
	// Once again, both can be explicitly set in options
	//
	var defaultLaunchdPath = launchAgent ? path.join(process.env.HOME,'Library/LaunchAgents/') : '/Library/LaunchDaemons/';  
	var launchdPath = options.launchdPath || defaultLaunchdPath;

	var defaultLogPath = runAsUser ? path.join(process.env.HOME,'Library/Logs') : '/Library/Logs';
	var logPath = options.logPath || defaultLogPath;
	logPath = path.join(logPath, name);
	config["logFolder"] = logPath;

	shell.mkdir('-p', logPath);

	console.log('chown ' + options.userName + ' ' + logPath);
	if (options.userName && shell.exec('chown ' + options.userName + ' ' + logPath).code != 0) {
		callback('could not chown log path: ' + logPath);
		return;
	}
	

    // creating a daemon requires root.  attempt to provide a better message here.
	if (launchdPath.indexOf('/Library/LaunchDaemons') == 0 && !checkRoot(callback)) {
		return;
	}

	if (options.workingDirectory) {
		plistData["WorkingDirectory"] = options.workingDirectory;	
	}
	

	//plistData["Debug"] = true;
	plistData["RunAtLoad"] = true;
	plistData["StandardOutPath"] = path.join(logPath, 'stdout.log');
	plistData["StandardErrorPath"] = path.join(logPath, 'stderr.log');
	
	if (options.env) {
		plistData["EnvironmentVariables"] = options.env;
	}

	var plistXml = plist.build(plistData).toString();

	if (!shell.test('-d', logPath)) {
		shell.mkdir('-p', logPath);
	};

	var plistPath = path.join(launchdPath, name + '.plist');
	config.definition = plistPath;
	fs.writeFile(plistPath, plistXml, 'utf8', function(err) {
		callback(err, config);
	});
}
