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
    musicFolders: []
}

var config = JSON.parse(localStorage.getItem('config'));

if(config === null) localStorage.setItem('config', JSON.stringify(defaultConfig));
else {
    console.log(1);
    var configChanged = false;

    if(config.theme === undefined) {
        config.theme  = defaultConfig.theme;
        configChanged = true;
    }
    if(config.volume === undefined) {
        console.log(2);
        config.volume = defaultConfig.volume;
        configChanged = true;
    }
    if(config.musicFolders === undefined) {
        config.musicFolders = defaultConfig.musicFolders;
        configChanged = true;
    };

    // save config if changed
    if(configChanged) {
        localStorage.setItem('config', JSON.stringify(config))
    }
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
    autoload: true,
});

db.reset = function() {
    db.remove({ }, { multi: true }, function (err, numRemoved) {
        db.loadDatabase(function (err) {
            if(err) {
                throw err
            }
        });
    });
};



/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {
    db               : db,
    supportedFormats : supportedFormats,
    audio            : audio,
    pathSrc          : pathSrc
};
