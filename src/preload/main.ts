import os from 'os';
import path from 'path';
import remote, { app, getCurrentWindow } from '@electron/remote';
import { ipcRenderer, shell } from 'electron';
import TeenyConf from 'teeny-conf';
import linvodb from 'linvodb3';
import leveljs from 'level-js';
import Promise from 'bluebird';

import { Config, TrackModel, PlaylistModel, Track } from '../shared/types/museeks';
import channels from '../shared/lib/ipc-channels';
import Player from '../renderer/lib/player';

const pathUserData = app.getPath('userData');

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

Promise.promisifyAll(Object.getPrototypeOf(Track.find()));
Promise.promisifyAll(Object.getPrototypeOf(Track.findOne()));
Promise.promisifyAll(Track);
Promise.promisifyAll(Playlist);

/*
|--------------------------------------------------------------------------
| File association - make it work one day
|--------------------------------------------------------------------------
*/

// TODO: only working on macOS, issue to follow:
// https://github.com/electron/electron/issues/27116
// app.on('open-file', (event, path) => {
//   event.preventDefault();
//   logger.info(path); // absolute path to file
// });

/*
|--------------------------------------------------------------------------
| Window object extension
| TODO: some of these should go to the main process and be converted to use
| contextBridge.exposeToMainWorld + sandboxed renderer
|--------------------------------------------------------------------------
*/

const browserwindow = getCurrentWindow();

const config = new TeenyConf<Config>(path.join(pathUserData, 'config.json'), {});

const player = new Player({
  volume: config.get('audioVolume'),
  playbackRate: config.get('audioPlaybackRate'),
  audioOutputDevice: config.get('audioOutputDevice'),
  muted: config.get('audioMuted'),
});

// When editing something here, please update museeks.d.ts to extend the
// window.__museeks global object.
const API = {
  __instantiated: false,
  platform: os.platform(),
  version: app.getVersion(),
  browserwindow,
  // After moving m3u export to the main process, re-enable me
  // browserwindow: {
  //   isFocused: browserwindow.isFocused,
  // },
  player,
  config,
  db: {
    Track,
    Playlist,
  },
  playlists: {
    resolveM3u: (path: string) => ipcRenderer.invoke(channels.PLAYLISTS_RESOLVE_M3U, path),
  },
  covers: {
    getCoverAsBase64: (track: Track) => ipcRenderer.invoke(channels.COVER_GET, track.path),
  },
  // To be removed:
  remote,
  path: {
    parse: path.parse,
    resolve: path.resolve,
  },
  shell: {
    showItemInFolder: shell.showItemInFolder,
    openExternal: shell.openExternal,
  },
};

window.__museeks = API;

export type MuseeksAPI = typeof API;
