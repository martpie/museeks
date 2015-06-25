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

var audio = new Audio();
audio.type   = 'audio/mpeg';
audio.volume = 0.5;



/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

var parseDuration = function (duration) {
    var min = parseInt(duration / 60);
    var sec = duration - 60 * min;

    if(sec < 10) sec = ('0' + sec).slice(-2)

    return min + ':' + sec;
};



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

var supportedFormats = ['audio/mp4', 'audio/mpeg'];



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
