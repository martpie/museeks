'use strict';

process.env.NODE_ENV = 'production';

const packager = require('electron-packager');
const app      = require('./package.json');

const options = {
    // required
    'dir'           :  './',
    'name'          :  'museeks',
    'platform'      :  ['win32', 'linux', 'darwin'],
    'arch'          :  'ia32',
    'version'       :  '0.36.2',
    'build-version' :  app.version,
    'app-version'   :  app.version,

    // optional
    'ignore'    : '/node_modules\/^((?!teeny-conf).)*$/',
    'out'       : 'build',
    'overwrite' :  true,
}

// Linux
console.log('Starting Museeks ' + app.version + ' build');
console.time('build');

packager(options, function (err, appPath) {
    if(err) throw err;
    else {
        console.timeEnd('build');
        console.log('Packages built');
        console.log('Starting app cleanup');
    }
});
