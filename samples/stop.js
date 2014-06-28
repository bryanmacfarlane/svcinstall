var sim = require('../lib/svcinstall');

var svcinstall = new sim.SvcInstall('myserver', 'com.sample');
svcinstall.stop(function(err) {
	if (err) {
		console.error('Failed to stop: ', err.message);
		return;
	}

	console.log('Stopped Successfully');
});
