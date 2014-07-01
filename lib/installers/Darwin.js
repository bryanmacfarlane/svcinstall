//
// Creates a Darwin (OSX) Launchd plist for automating running as a Daemon
// References: 
//             https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/launchctl.1.html
//             https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
//

var plist = require('plist');
var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

var LD_PATH = '/Library/LaunchDaemons/';

var getPath = function(name) {
	return path.join(LD_PATH, name + '.plist');
}

var checkRoot = function(callback) {
	if (process.getuid() > 0) {
		callback(new Error('Must be run as root (use sudo)'));
		return false;
	}

	return true;
}

var launchctl = function(command, callback) {
	if (!checkRoot(callback)) {
		return;
	}

	cp.exec('launchctl ' + command, function(err, stdout, stderr) {
		if (err) {
			callback(new Error(stderr));
			return;
		}

		if (stdout) {
			console.log(stdout);
		}

		callback();
	});
}

exports.start = function(name, callback) {
	launchctl('load -w ' + getPath(name), callback);
}

exports.stop = function(name, callback) {
	launchctl('unload ' + getPath(name), callback);
}

exports.uninstall = function(name, callback) {
	launchctl('remove ' + name, function(err) {
		shell.rm(getPath(name));
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
// callback(err)
//
exports.install = function(name, options, callback) {
	if (!checkRoot(callback)) {
		return;
	}

	var plistPath = path.join(LD_PATH, name + '.plist');
	console.log('Installing Service: ' + name);
	console.log('Location: ' + plistPath);
	
	var logPath = path.join('/Library/Logs', name);

	var plistData = {};
	plistData["Label"] = name;
	plistData["ProgramArguments"] = options.args;
	plistData["RunAtLoad"] = true;
	plistData["WorkingDirectory"] = options.workingDirectory;
	plistData["StandardOutPath"] = path.join(logPath, 'stdout.log');
	plistData["StandardErrorPath"] = path.join(logPath, 'stdout.log');
	if (options.env) {
		plistData["EnvironmentVariables"] = options.env;
	}
	var plistXml = plist.build(plistData).toString();

	if (!shell.test('-d', logPath)) {
		shell.mkdir('-p', logPath);
	};

	fs.writeFile(plistPath, plistXml, 'utf8', callback);
}