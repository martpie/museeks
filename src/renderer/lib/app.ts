import path from 'path';
import { app, getCurrentWindow } from '@electron/remote';
import linvodb from 'linvodb3';
import leveljs from 'level-js';
import teeny from 'teeny-conf';
import Promise from 'bluebird';
import { TrackModel, PlaylistModel } from '../../shared/types/museeks';

/*
|--------------------------------------------------------------------------
| Some variables
|--------------------------------------------------------------------------
*/

export const browserWindows = {
  main: getCurrentWindow(),
};

export const pathUserData = app.getPath('userData');
export const pathSrc = __dirname;

/*
|--------------------------------------------------------------------------
| Files association
|--------------------------------------------------------------------------
*/

// TODO: only working on macOS, issue to follow:
// https://github.com/electron/electron/issues/27116
app.on('open-file', (event, path) => {
  event.preventDefault();
  console.info(path); // absolute path to file
});

/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

export const config = new teeny(path.join(pathUserData, 'config.json'));

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

linvodb.defaults.store = { db: leveljs }; // Comment out to use LevelDB instead of level-js
// Set dbPath - this should be done explicitly and will be the dir where each model's store is saved
linvodb.dbPath = pathUserData;

const Track: TrackModel = new linvodb('track');
Track.ensureIndex({ fieldName: 'path', unique: true });

const Playlist: PlaylistModel = new linvodb('playlist');
Playlist.ensureIndex({ fieldName: 'importPath', unique: true, sparse: true });

export const db = {
  Track,
  Playlist,
};

Promise.promisifyAll(Object.getPrototypeOf(db.Track.find()));
Promise.promisifyAll(Object.getPrototypeOf(db.Track.findOne()));
Promise.promisifyAll(db.Track);
Promise.promisifyAll(db.Playlist);

/*
|--------------------------------------------------------------------------
| Other exports
|--------------------------------------------------------------------------
*/

export const version = app.getVersion(); // Museeks version
