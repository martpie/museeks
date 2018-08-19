import * as electron from 'electron';
import linvodb from 'linvodb3';
import leveljs from 'level-js';
import * as path from 'path';
import teeny from 'teeny-conf';
import * as Promise from 'bluebird';

const { remote } = electron;
const { app } = remote;

/*
|--------------------------------------------------------------------------
| Some variables
|--------------------------------------------------------------------------
*/

export const browserWindows = {
  main: remote.getCurrentWindow()
};

export const pathUserData = app.getPath('userData');
export const pathSrc = __dirname;

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

export const supportedExtensions = [
  // MP3 / MP4
  '.mp3',
  '.mp4',
  '.aac',
  '.m4a',
  '.3gp',
  '.wav',

  // Opus
  '.ogg',
  '.ogv',
  '.ogm',
  '.opus',

  // Flac
  '.flac'
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
  loweredMetas: {
    artist: [String],
    album: String,
    albumartist: [String],
    title: String,
    genre: [String]
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

export const models = {
  Track,
  Playlist
};

Promise.promisifyAll(Object.getPrototypeOf(models.Track.find()));
Promise.promisifyAll(models.Track);
Promise.promisifyAll(models.Playlist);

/*
|--------------------------------------------------------------------------
| Other exports
|--------------------------------------------------------------------------
*/

export const version = app.getVersion(); // Museeks version
export const config = conf; // teeny-conf
export const initialConfig = conf.getAll(); // the config at the start of the application
