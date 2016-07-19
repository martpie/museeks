import nedb   from 'nedb';
import fs     from 'fs';
import path   from 'path';
import teeny  from 'teeny-conf';

const remote = electron.remote;

const app    = remote.app;


/*
|--------------------------------------------------------------------------
| Some variables
|--------------------------------------------------------------------------
*/

const browserWindows = {};
browserWindows.main = remote.getCurrentWindow();

const pathUserData = app.getPath('userData'),
    pathSrc      = __dirname;


/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

const conf = new teeny(path.join(pathUserData, 'config.json'));
conf.loadOrCreateSync();


/*
|--------------------------------------------------------------------------
| supported Formats
|--------------------------------------------------------------------------
*/

const supportedFormats = [
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

const audio = new Audio();
audio.volume = conf.get('audioVolume');
audio.playbackRate = conf.get('audioPlaybackRate');


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

const db = new nedb({
    filename: path.join(pathUserData, 'library.db'),
    autoload: true
});

db.reset = function() {
    db.remove({}, { multi: true }, (err) => {
        if(err) console.warn(err);
        db.loadDatabase((err) => {
            if(err) throw err;
        });
    });
};

// WTFix, db.loadDatabase() throw an error if the line below is not here
fs.writeFile(path.join(pathUserData, '.init'), '', (err) => {
    if(err) console.error(err);
});


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {
    db,               // database
    supportedFormats, // supported audio formats
    audio,            // HTML5 audio tag
    pathSrc,          // path of the app
    browserWindows,   // Object containing all the windows
    version       : app.getVersion,   // Museeks version
    config        : conf,             // teeny-conf
    initialConfig : conf.getAll(),    // the config at the start of the application
};
