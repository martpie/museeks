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

let browserWindows = {};
    browserWindows.main = remote.getCurrentWindow();

let pathUserData = app.getPath('userData'),
    pathSrc      = __dirname;



/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

let conf = new teeny(path.join(pathUserData, 'config.json'));
conf.loadOrCreateSync();



/*
|--------------------------------------------------------------------------
| supported Formats
|--------------------------------------------------------------------------
*/

let supportedFormats = [
    'audio/mp3',
    'audio/mp4',
    'audio/mpeg3',
    'audio/x-mpeg-3',
    'audio/mpeg',
    'audio/mpeg4-generic',
    'audio/mp4a',
    'audio/mp4a-latm',
    'audio/mpga',

    'audio/aac',
    'audio/aacp',
    'audio/x-aac',
    'audio/x-m4a',
    'audio/x-m4p',
    'audio/x-m4b',

    'audio/3gpp',
    'audio/3gpp2',

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

let audio = new Audio();
    audio.volume = conf.get('audioVolume');
    audio.playbackRate = conf.get('audioPlaybackRate');

audio.addEventListener('ended', AppActions.player.next);
audio.addEventListener('error', AppActions.player.audioError);



/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

let db = new nedb({
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
fs.writeFile(path.join(pathUserData, '.init'), '', (err) => { if(err) throw err; });



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
