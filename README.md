# SvcInstall

SvcInstall installs services on OSX (launchd) and Linux (inet.d start-stop-dameon)


>  - Small and lightweight
>  - Avoid coupling with any keep alive or monitoring solution.  You Pick ( [SvcHost] is decoupled sister project)
>  - Can point a node project, a shell script, etc... Whatever you choose.
>  - Package installer with your app or service

## Install:

    npm install svcinstall --save


## Sample:
See /samples for more

```js
var path = require('path');
var si = require('svcinstall');

var scriptPath = path.join(__dirname, 'server.js');
var options = { 
		args: ['/usr/local/bin/node', scriptPath],
		workingDirectory: path.dirname(scriptPath)
	};

var svcinstall = new si.SvcInstall();
svcinstall.install('myserver.com.sample', options, function(err, config){
	if (err) {
		console.error('Error:', err.message);
		return;
	}

	console.log('Installed Successfully');

	svcinstall.start(config.definition, function(err) {
		if (err) {
			console.error('Failed to start: ', err.message);
			return;
		}

		console.log('Started Successfully');
	});
});
```

License
----

Apache 2.0

[svchost]:http://github.com/bryanmacfarlane/svchost

