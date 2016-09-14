import linvodb  from 'linvodb3';
import leveljs  from 'level-js';
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

const pathUserData = app.getPath('userData');
const pathSrc      = __dirname;


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
    '.mp3',
    '.mp4',
    '.aac',
    '.m4a',
    '.3gp',
    '.wav',
    '.ogg'
];


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

linvodb.defaults.store = { db: leveljs }; // Comment out to use LevelDB instead of level-js
// Set dbPath - this should be done explicitly and will be the dir where each model's store is saved
linvodb.dbPath = pathUserData;

const Track = new linvodb('track', {
    album: String,
    albumartist: [String],
    artist: [String],
    cover: {
        default: null
    },
    disk: {
        no: Number,
        of: Number
    },
    duration: Number,
    genre: [String],
    loweredMetas : {
        artist      : [String],
        album       : String,
        albumartist : [String],
        title       : String,
        genre       : [String]
    },
    path: String,
    playCount: Number,
    title: String,
    track: {
        no: Number,
        of: Number
    },
    year: String
});

Track.ensureIndex({ fieldName: 'path', unique: true });

const Playlist = new linvodb('playlist', {
    name: String,
    tracks: {
        type: [String],
        default: []
    }
});

const models = {
    Track,
    Playlist
};

Promise.promisifyAll(models.Track);
Promise.promisifyAll(models.Playlist);


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {
    supportedExtensions, // supported audio formats
    pathSrc,             // path of the app
    browserWindows,      // Object containing all the windows
    models,              // database models
    version       : app.getVersion(), // Museeks version
    config        : conf,             // teeny-conf
    initialConfig : conf.getAll(),    // the config at the start of the application
};
