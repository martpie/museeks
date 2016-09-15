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
    return fs.readdirSync(srcpath).filter((file) => {
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
    'name'          :  'Museeks',
    'platform'      : ['darwin', 'win32', 'linux'],
    'arch'          : ['ia32', 'x64'],
    'version'       :  '1.4.0',
    'icon'          :  path.join('src', 'images', 'logos', 'museeks'),
    'build-version' :  app.version,
    'app-version'   :  app.version,

    // optional
    'prune'     :  true,
    'ignore'    : /(build|node_modules\/+?(?!teeny).+)/,
    'out'       :  path.join('build', 'dist', app.version),
    'overwrite' :  true,
};


/*
|--------------------------------------------------------------------------
| Main stuff
|--------------------------------------------------------------------------
*/

console.info(`Starting Museeks ${app.version} build`);

packager(options, (err) => {
    if(err) throw err;
    else {
        console.info('Builds cleanup');

        const versionPath = path.join(__dirname, 'build', 'dist', app.version);
        const buildsPathes = getDirectories(versionPath);

        buildsPathes.forEach((folder) => {
            const appPath = path.join(versionPath, folder, 'resources', 'app');
            rimraf(`${appPath}/src/js`, {}, () => {});
            rimraf(`${appPath}/src/styles`, {}, () => {});
        });
    }
});
