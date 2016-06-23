import nedb   from 'nedb';
import fs     from 'fs';
import path   from 'path';
import teeny  from 'teeny-conf';

import AppActions from '../actions/AppActions';

const remote = electron.remote;

const app    = remote.app;
const screen = remote.screen;



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
| Config
|--------------------------------------------------------------------------
*/

var conf = teeny.loadOrCreateSync(path.join(pathUserData, 'config.json'), {});



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

var audioOptions = conf.get('audio');
    audio.volume = audioOptions.volume;
    audio.playbackRate = audioOptions.playbackRate;

audio.addEventListener('ended', AppActions.player.next);
audio.addEventListener('error', AppActions.player.audioError);



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
    version          : app.getVersion,   // Museeks version
    config           : conf,             // teeny-conf
    initialConfig    : conf.getAll(),    // the config at the start of the application
    db               : db,               // database
    supportedFormats : supportedFormats, // supported audio formats
    audio            : audio,            // HTML5 audio tag
    pathSrc          : pathSrc,          // path of the app
    browserWindows   : browserWindows    // Object containing all the windows
};
