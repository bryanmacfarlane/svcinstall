var sim = require('../lib/svcinstall');

var svcinstall = new sim.SvcInstall('myserver', 'com.sample');
svcinstall.status(function(err) {
	if (err) {
		console.error('Status Failed: ', err.message);
		return;
	}
});
