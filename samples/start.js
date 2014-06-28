var sim = require('../lib/svcinstall');

var svcinstall = new sim.SvcInstall('myserver', 'com.sample');
svcinstall.start(function(err) {
	if (err) {
		console.error('Failed to start: ', err.message);
		return;
	}

	console.log('Started Successfully');
});
