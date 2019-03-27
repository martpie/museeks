import * as electron from 'electron';
import linvodb from 'linvodb3';
import leveljs from 'level-js';
import * as path from 'path';
import teeny from 'teeny-conf';
import * as Promise from 'bluebird';
import { TrackModel, PlaylistModel } from 'src/shared/types/interfaces';

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

export const models = {
  Track,
  Playlist
};

Promise.promisifyAll(Object.getPrototypeOf(models.Track.find()));
Promise.promisifyAll(Object.getPrototypeOf(models.Track.findOne()));
Promise.promisifyAll(models.Track);
Promise.promisifyAll(models.Playlist);

/*
|--------------------------------------------------------------------------
| Other exports
|--------------------------------------------------------------------------
*/

export const version = app.getVersion(); // Museeks version
