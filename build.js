'use strict';

const packager = require('electron-packager');
const app      = require('./package.json');

const options = {
    // required
    'dir'           :  './',
    'name'          :  'Museeks',
    'platform'      : ['linux', 'win32', 'darwin'],
    'arch'          :  'ia32',
    'version'       :  '0.36.2',
    'build-version' :  '1',
    'app-version'   : 'la',

    // optional
    'ignore'    :  new RegExp('/node_modules/^(?!teeny-conf$).*/'),
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
        console.log('Package build in directory : ' + appPath);
        console.log('Starting app compilation');

        // TODO delete everything in folder and import compilated files
    }
});
