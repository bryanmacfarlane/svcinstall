var sim = require('../lib/svcinstall');

var svcinstall = new sim.SvcInstall('myserver', 'com.sample');
svcinstall.uninstall(function(err) {
	if (err) {
		console.error('Failed to uninstall: ', err.message);
		return;
	}

	console.log('Uninstalled Successfully');
});
