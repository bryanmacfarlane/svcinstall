//
// Creates a Systemd unit for automating running as a Daemon on Linux
//

var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

function checkRoot(callback) {
  if (process.getuid() > 0) {
    callback(new Error('Must be run as root (or use sudo)'));
    process.exit(1);
  }
}

function checkSystemd(callback) {
  try {
    fs.accessSync('/bin/systemctl', fs.X_OK);
  }
  catch (e) {
    callback(new Error('For now, only systemd is available in Linux, /bin/systemctl not detected.'));
    process.exit(1);
  }
}

function getSystemdUnitPath(callback) {
  var unitPath = '/usr/lib/systemd/system';

  try {
    fs.accessSync(unitPath, fs.W_OK);

    return unitPath;
  }
  catch (e) {
    unitPath = '/lib/systemd/system';

    try {
      fs.accessSync(unitPath, fs.W_OK);

      return unitPath;
    }
    catch (e) {
      callback(new Error('Path for unit files not found, /usr/lib/systemds/system and /lib/systemd/system tried'));
      process.exit(1);
    }
  }
}


function systemctl(command, callback) {
  callback = callback || function() {};

  checkRoot(callback);

  cp.exec('systemctl ' + command, function (err, stdout, stderr) {
    if (stdout) {
      console.log(stdout);
    }

    if (err) {
      console.error(stderr);
      callback(err);
      return;
    }

    callback();
  });
}

exports.start = function (path, callback) {
  systemctl('start ' + path.name, callback);
}

exports.stop = function (path, callback) {
  systemctl('stop ' + path.name, callback);
}

exports.restart = function (path, callback) {
  systemctl('restart ' + path.name, callback);
}

exports.enable = function (path, callback) {
  systemctl('enable ' + path.name, callback);
}

exports.disable = function (path, callback) {
  systemctl('disable ' + path.name, callback);
}

exports.uninstall = function (path, callback) {
  systemctl('stop ' + path.name, function (err) {
    systemctl('disable ' + path.name, function (err) {
      shell.rm(path.unitPath);
    });
  });
}

exports.status = function (name, callback) {
  systemctl('status ' + name, callback);
}

//
// Options:
//  program - path to program or script to run
//  user - user to run as.  defaults to root
//  args - array of args passed to script
//
// callback(err, config)
//
exports.install = function (name, options, callback) {
  var config = {}, // the resultant config given back to caller so they can store if they want
      service = {},
      unit = '',
      systemdPath;

  callback = callback || function() {};

  checkRoot(callback);
  checkSystemd(callback);
  systemdPath = getSystemdUnitPath(callback);

  console.log('Installing Service: ' + name);

  options = options || {};

  service.name = name;
  service.command = options.args.join(' ');
  service.path = options.env && options.env.PATH ? options.env.PATH : process.env.PATH;
  service.user = options.userName || 'root';
  service.logIdentifier = 'vsoagent-' + name;
  service.unitPath = path.join(systemdPath, name + '.service');

  config.name = name;
  config.runAsUser = service.user;
  config.logFolder = 'syslog';
  config.definition = service;

  unit += '[Service]' + "\n";
  unit += 'ExecStart=' + service.command + "\n";
  unit += 'Restart=always' + "\n";
  unit += 'StandardOutput=syslog' + "\n";
  unit += 'StandardError=syslog' + "\n";
  unit += 'SyslogIdentifier=' + service.logIdentifier + "\n";
  unit += 'User=' + service.user + "\n";
  unit += 'Group=' + service.user + "\n";
  unit += 'Environment=NODE_ENV=production' + "\n";
  unit += 'Environment=PATH=' + service.path + "\n";
  unit += "\n";
  unit += '[Install]' + "\n";
  unit += 'WantedBy=multi-user.target' + "\n";

  fs.writeFile(service.unitPath, unit, 'utf8', function (err) {
    if (err) {
      callback(new Error('Error writing ' + service.unitPath));
      process.exit(1);
    }

    cp.exec('systemctl daemon-reload', function (err, stdout, stderr) {
      if (err) {
        callback(new Error('Error reloading daemons'));
        process.exit(1);
      }

      callback(err, config);
    });
  });
}
