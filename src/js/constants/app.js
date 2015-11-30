import nedb   from 'nedb';
import fs     from 'fs';
import path   from 'path';
import remote from 'remote';

import AppActions from '../actions/AppActions';

var app = remote.require('app');



/*
|--------------------------------------------------------------------------
| Config - set, get and check
|--------------------------------------------------------------------------
*/

var defaultConfig = {
    theme: 'light',
    volume: 1,
    musicFolders: [],
    devMode: false
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
| Variables
|--------------------------------------------------------------------------
*/

var pathConfig       = app.getPath('userData');
var pathConfigFile   = path.join(pathConfig, 'config.json');
var pathSrc          = __dirname;
var supportedFormats = ['audio/mp4', 'audio/mpeg', 'audio/wav'];



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
    filename: path.join(pathConfig, 'library.db'),
    autoload: true
});

db.reset = function() {
    db.remove({}, { multi: true }, function (err, numRemoved) {
        db.loadDatabase(function (err) {
            if(err) throw err;
        });
    });
};

// WTFix, de.loadDatabase() throw an error if the line below is not here
fs.writeFile(path.join(pathConfig, '.init'), "", (err) => { if(err) throw err; });


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
    pathSrc          : pathSrc           // path of the app
};
