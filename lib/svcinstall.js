var os = require('os');

var osType = os.type();
var supported = ['Darwin', 'Linux'];

var SvcInstall = (function() {
	// namespace optional
    function SvcInstall() {
		if (supported.indexOf(osType) < 0) {
			throw new Error(osType + ' is not supported');
		}

		this.installer = require('./installers/' + osType);
	}

	//
	// Options: 
	//	scriptPath - 
	//  user - user to run as.  defaults to root
	//  args - array of args passed to script
	//  env - optional. env vars to set
	//
	// callback(err)
	//
	SvcInstall.prototype.install = function(name, options, callback) {
		this.installer.install(name, options, callback);
	}

	SvcInstall.prototype.start = function(path, callback) {
		this.installer.start(path, callback);
	}

	SvcInstall.prototype.stop = function(path, callback) {
		this.installer.stop(path, callback);	
	}

	SvcInstall.prototype.status = function(name, callback) {
		this.installer.status(name, callback);	
	}

	SvcInstall.prototype.uninstall = function(path, callback) {
		this.installer.uninstall(path, callback);	
	}

	return SvcInstall;
})();

exports.SvcInstall = SvcInstall;