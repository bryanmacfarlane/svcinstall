var os = require('os');

var osType = os.type();
var supported = ['Darwin', 'Linux'];

var SvcInstall = (function() {
	// namespace optional
    function SvcInstall(name, namespace) {
		this.name = name;
		this.namespace = namespace; 
		this.svcname = namespace ? namespace + '.' + name : name;

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
	SvcInstall.prototype.install = function(options, callback) {
		this.installer.install(this.svcname, options, callback);
	}

	SvcInstall.prototype.start = function(callback) {
		this.installer.start(this.svcname, callback);
	}

	SvcInstall.prototype.stop = function(callback) {
		this.installer.stop(this.svcname, callback);	
	}

	SvcInstall.prototype.status = function(callback) {
		this.installer.status(this.svcname, callback);	
	}

	SvcInstall.prototype.uninstall = function(callback) {
		this.installer.uninstall(this.svcname, callback);	
	}

	return SvcInstall;
})();

exports.SvcInstall = SvcInstall;