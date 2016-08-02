import nedb     from 'nedb';
import fs       from 'fs';
import path     from 'path';
import teeny    from 'teeny-conf';
import Promise  from 'bluebird';

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

const supportedExtensions = [
    'mp3',
    'mp4',
    'aac',
    'm4a',
    '3gp',
    'wav',
    'ogg'
];


/*
|--------------------------------------------------------------------------
| Audio
|--------------------------------------------------------------------------
*/

// What plays the music

const volume = conf.get('audioVolume');
const audioPlaybackRate = conf.get('audioPlaybackRate');

const audios = [
    new Audio(), // previous
    new Audio(), // current
    new Audio()  // next
];

audios.forEach((elem) => {
    elem.volume = volume;
    elem.playbackRate = audioPlaybackRate;
});

const audio = new AudioContext();


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

const db = new nedb({
    filename: path.join(pathUserData, 'library.db'),
    autoload: true
});

Promise.promisifyAll(db);

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
    db,                   // database
    supportedExtensions,  // supported audio formats
    audios,               // object of HTML5 audio element
    audio,
    pathSrc,              // path of the app
    browserWindows,       // Object containing all the windows
    version       : app.getVersion(), // Museeks version
    config        : conf,             // teeny-conf
    initialConfig : conf.getAll(),    // the config at the start of the application
};
