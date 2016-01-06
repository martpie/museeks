'use strict';

process.env.NODE_ENV = 'production';

const fs       = require('fs');

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
    'prune'     :  true,
    'ignore'    : '/node_modules\/^((?!teeny-conf).)*$/',
    'out'       : 'build',
    'overwrite' :  true,
}

// Linux
console.log('Starting Museeks ' + app.version + ' build');
console.time('build');

console.log(JSON.stringify(options, null, " "));

/*fs.readdir('./build', function(files) {
    console.log(files);
});*/

/*packager(options, function (err, appPath) {
    if(err) throw err;
    else {
        console.timeEnd('build');
        console.log('Packages built');
        console.log('Starting app cleanup');
    }
});*/
