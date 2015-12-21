import nedb   from 'nedb';
import fs     from 'fs';
import path   from 'path';
import remote from 'remote';

import AppActions from '../actions/AppActions';

var app    = remote.require('app');
var screen = remote.require('screen');



/*
|--------------------------------------------------------------------------
| Some variables
|--------------------------------------------------------------------------
*/

var browserWindows = {};
    browserWindows.main = remote.getCurrentWindow();

var pathUserData     = app.getPath('userData'),
    pathSrc          = __dirname;



/*
|--------------------------------------------------------------------------
| Config - set, get and check
|--------------------------------------------------------------------------
*/

var workArea = screen.getPrimaryDisplay().workArea;

var defaultConfig = {
    theme: 'light',
    volume: 1,
    musicFolders: [],
    devMode: false,
    bounds: {
        width: 1000,
        height: 600,
        x: parseInt(workArea.width / 2),
        y: parseInt(workArea.height / 2)
    }
}

var config = JSON.parse(localStorage.getItem('config'));

if(config === null) {
    localStorage.setItem('config', JSON.stringify(defaultConfig));
    config = defaultConfig;
}
else {
    var configChanged = false;

    for(var key in defaultConfig) {
        if(config[key] === undefined) {
            config[key]   = defaultConfig[key];
            configChanged = true;
        }
    }

    // save config if changed
    if(configChanged) localStorage.setItem('config', JSON.stringify(config));
}



/*
|--------------------------------------------------------------------------
| supported Formats
|--------------------------------------------------------------------------
*/

var supportedFormats = [
    'audio/mp3',
    'audio/mp4',
    'audio/mpeg3',
    'audio/x-mpeg-3',
    'audio/mpeg',

    'audio/wav',
    'audio-wave',
    'audio/x-wav',
    'audio/x-pn-wav',

    'audio/ogg'
];



/*
|--------------------------------------------------------------------------
| Audio
|--------------------------------------------------------------------------
*/

// What plays the music
var audio = new Audio();
    audio.type   = 'audio/mpeg';
    audio.volume = config.volume;

audio.addEventListener('ended', AppActions.player.next);



/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

var db = new nedb({
    filename: path.join(pathUserData, 'library.db'),
    autoload: true
});

db.reset = function() {
    db.remove({}, { multi: true }, function (err, numRemoved) {
        db.loadDatabase(function (err) {
            if(err) throw err;
        });
    });
};

// WTFix, db.loadDatabase() throw an error if the line below is not here
fs.writeFile(path.join(pathUserData, '.init'), "", (err) => { if(err) throw err; });



/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {
    initialConfig    : config,           // the config at the start of the application
    db               : db,               // database
    supportedFormats : supportedFormats, // supported audio formats
    audio            : audio,            // HTML5 audio tag
    pathSrc          : pathSrc,          // path of the app
    browserWindows   : browserWindows    // Object containing all the windows
};
