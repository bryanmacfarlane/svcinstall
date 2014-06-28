var sim = require('../lib/svcinstall');

var svcinstall = new sim.SvcInstall('com.sample', 'myserver');
svcinstall.stop(function(err) {
	if (err) {
		console.error('Failed to stop: ', err);
	}

	console.log('Stopped Successfully');
});
