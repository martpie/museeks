"use strict";



/*
|--------------------------------------------------------------------------
| Requires
|--------------------------------------------------------------------------
*/

var remote = require('remote');

var dialog         = remote.require('dialog'),
    app            = remote.require('app'),
    Menu           = remote.require('menu'),
    MenuItem       = remote.require('menu-item'),
    globalShortcut = remote.require('global-shortcut');

var fs     = require('fs'),
    path   = require('path'),
    nconf  = require('nconf'),
    nedb   = require('nedb'),
    walk   = require('walk'),
    mime   = require('mime'),
    mmd    = require('musicmetadata');


// Investigate why performance are poor with that
/*var React           = require('react'),
    ReactKeyBinding = require('react-keybinding'),
    ReactBootstrap  = require('react-bootstrap');*/

var ReactKeybinding = require('react-keybinding');



/*
|--------------------------------------------------------------------------
| Variables
|--------------------------------------------------------------------------
*/

var pathConfig     = app.getPath('userData');
var pathConfigFile = path.join(pathConfig, 'config.json');
var pathSrc        = __dirname;

var Window = remote.getCurrentWindow();
    Window.maximized = false;

var views = {};

var supportedFormats = ['audio/mp4', 'audio/mpeg', 'audio/wav'];



/*
|--------------------------------------------------------------------------
| Config
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


/*
|--------------------------------------------------------------------------
| Theme - maybe imagine a better implementation for this feature
|--------------------------------------------------------------------------
*/

var themeName = nconf.get('theme');


var theme = document.createElement('link');
theme.type  = 'text/css';
theme.rel   = 'stylesheet';
theme.media = 'all';
theme.href  =  pathSrc + '/dist/css/themes/' + themeName + '/theme-' + themeName + '.css';
theme.id    = 'theme-stylesheet';

document.querySelector('head').appendChild(theme);



/*
|--------------------------------------------------------------------------
| Audio
|--------------------------------------------------------------------------
*/

// What plays the music
var audio = new Audio();
    audio.type   = 'audio/mpeg';
    audio.volume = 0.5;



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
};
