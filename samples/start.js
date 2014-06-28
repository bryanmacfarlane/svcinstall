var sim = require('../lib/svcinstall');

var svcinstall = new sim.SvcInstall('com.sample', 'myserver');
svcinstall.start(function(err) {
	if (err) {
		console.error('Failed to start: ', err);
	}

	console.log('Started Successfully');
});
