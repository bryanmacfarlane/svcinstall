var os = require('os');

var osType = os.type();
var supported = ['Darwin', 'Linux'];

var SvcInstall = (function() {
    function SvcInstall(namespace, name) {
		this.name = name;
		this.namespace = namespace; 
		this.svcname = osType === 'Darwin' ? namespace + '.' + name : name;

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

	return SvcInstall;
})();

exports.SvcInstall = SvcInstall;