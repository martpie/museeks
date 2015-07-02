"use strict";



/*
|--------------------------------------------------------------------------
| Requires
|--------------------------------------------------------------------------
*/

var remote = require('remote');

var dialog         = remote.require('dialog');
var app            = remote.require('app');
var globalShortcut = remote.require('global-shortcut');

var fs     = require('fs'),
    path   = require('path'),
    nconf  = require('nconf'),
    nedb   = require('nedb'),
    walk   = require('walk'),
    mime   = require('mime'),
    mmd    = require('musicmetadata');



/*
|--------------------------------------------------------------------------
| Globals
|--------------------------------------------------------------------------
*/

// What plays the music
var audio = new Audio();
    audio.type   = 'audio/mpeg';
    audio.volume = 0.5;



/*
|--------------------------------------------------------------------------
| Variables
|--------------------------------------------------------------------------
*/

var defaultConfig = require('./' + path.join('js', 'default.config.json'));

var pathConfig     = app.getPath('userData');
var pathConfigFile = path.join(pathConfig, 'config.json');
var pathApp        = process.cwd();
var pathSrc        = path.join(pathApp, 'src');

var Window = remote.getCurrentWindow();
    Window.maximized = false;

var views = {};

var supportedFormats = ['audio/mp4', 'audio/mpeg', 'audio/wav'];



/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

var db = new nedb({
    filename: path.join(pathConfig, 'library.db'),
    autoload: true,
});

db.reset = function() {
    db.remove({ }, { multi: true }, function (err, numRemoved) {
        db.loadDatabase(function (err) {
            if(!err) {
                alerts.add('success', 'Database has been resetted.');
            } else {
                alerts.add('danger', 'Database could not be resetted =()');
            }
        });
    });

    Instance.refreshLibrary();
}



/*
|--------------------------------------------------------------------------
| Others
|--------------------------------------------------------------------------
*/

if(fs.existsSync(pathConfigFile)) {

    nconf.argv()
         .env()
         .file({ file: pathConfigFile });

} else {

    fs.writeFileSync(pathConfigFile, JSON.stringify(defaultConfig));
    nconf.argv()
         .env()
         .file({ file: pathConfigFile });

}
