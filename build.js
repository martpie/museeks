'use strict';

process.env.NODE_ENV = 'production';



/*
|--------------------------------------------------------------------------
| Modules
|--------------------------------------------------------------------------
*/

const fs       = require('fs');
const path     = require('path');

const packager = require('electron-packager');
const rimraf   = require('rimraf');
const app      = require('./package.json');



/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}



/*
|--------------------------------------------------------------------------
| Build config
|--------------------------------------------------------------------------
*/

const options = {
    // required
    'dir'           :  './',
    'name'          :  'museeks',
    'platform'      : ['darwin', 'win32', 'linux'],
    'arch'          : ['ia32', 'x64'],
    'version'       :  '1.2.2',
    'icon'          :  path.join('src', 'images', 'logos', 'museeks.png'),
    'build-version' :  app.version,
    'app-version'   :  app.version,

    // optional
    'prune'     :  true,
    'ignore'    : /(build|node_modules\/+?(?!teeny).+)/,
    'out'       :  path.join('build', app.version),
    'overwrite' :  true,
}



/*
|--------------------------------------------------------------------------
| Main stuff
|--------------------------------------------------------------------------
*/

console.log('Starting Museeks ' + app.version + ' build');
console.time('build');

packager(options, function (err, appPath) {
    if(err) throw err;
    else {
        console.timeEnd('build');
        console.log('Builds cleanup');

        var buildsPathes = getDirectories(path.join('./build', app.version));

        buildsPathes.forEach(function(folder, index) {
            var appPath = './build/' + folder + '/resources/app/';

            rimraf(appPath + 'src/images', {}, function() {});
            rimraf(appPath + 'src/js', {}, function() {});
            rimraf(appPath + 'src/styles', {}, function() {});
        });
   }
});
