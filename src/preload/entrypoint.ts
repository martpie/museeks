import os from 'os';
import path from 'path';

import '@total-typescript/ts-reset';
import { Menu, app } from '@electron/remote';
import { IpcRendererEvent, contextBridge, ipcRenderer, shell } from 'electron';

import { Config, Track } from '../shared/types/museeks';
import channels from '../shared/lib/ipc-channels';
import { parseUri } from '../shared/lib/utils-uri';

import db from './db';

/**
 * Ok, so what is there exactly?
 *
 * Preload is still very new to Museeks as I'm trying to upgrade Museeks to
 * Electron's best practices, but basically:
 *
 *   - We were using XActions in the past as an "API"
 *   - I am moving parts of those APIs here
 *   - Those APIs should at some point get rid of Node.js to enable contextbridge
 *   - Some of those APIs implementations may need to go to the main process instead
 *   - There's many things to refactor, some things will look weird as they are
 *     in an in-between state.
 */

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
| Config API: the config lives in the main process and we communicate with
| it via IPC
|--------------------------------------------------------------------------
*/

const config = {
  __initialConfig: ipcRenderer.sendSync(channels.CONFIG_GET_ALL),
  getAll(): Promise<Config> {
    return ipcRenderer.invoke(channels.CONFIG_GET_ALL);
  },
  get<T extends keyof Config>(key: T): Promise<Config[T]> {
    return ipcRenderer.invoke(channels.CONFIG_GET, key);
  },
  set<T extends keyof Config>(key: T, value: Config[T]): Promise<void> {
    return ipcRenderer.invoke(channels.CONFIG_SET, key, value);
  },
};

/*
|--------------------------------------------------------------------------
| Window object extension
| TODO: some of these should go to the main process and be converted to use
| contextBridge.exposeToMainWorld + sandboxed renderer
|--------------------------------------------------------------------------
*/

const ElectronAPI = {
  ipcRenderer: {
    // FIXME unsafe
    // All these usage should probably go to the main process, or we should
    // expose explicit APIs for what those usages are trying to solve
    on: (
      channel: string,
      listener: (event: IpcRendererEvent, value: any) => void,
    ) => {
      const listenerCount = ipcRenderer.listenerCount(channel);
      if (listenerCount === 0) {
        ipcRenderer.on(channel, listener);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `Event "${channel}" already has ${listenerCount} listeners, aborting.`,
        );
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    off: (
      channel: string,
      _listener: (event: IpcRendererEvent, value: any) => void,
    ) => {
      // Because we function cannot be passed between preload / renderer,
      // ipcRenderer.off does not work. Until we fix the FIXME unsafe above
      ipcRenderer.removeAllListeners(channel);
      // ipcRenderer.off(channel, listener);
    },
    send: ipcRenderer.send,
    sendSync: ipcRenderer.sendSync,
    invoke: ipcRenderer.invoke,
  },
  menu: {
    showContextMenu: (template: Electron.MenuItemConstructorOptions[]) => {
      const context = Menu.buildFromTemplate(template);
      context.popup({});
    },
  },
};

// When editing something here, please update museeks.d.ts to extend the
// window.MuseeksAPI global object.
const MuseeksAPI = {
  platform: os.platform(),
  version: app.getVersion(),
  config,
  app: {
    ready: () => ipcRenderer.send(channels.APP_READY),
    restart: () => ipcRenderer.send(channels.APP_RESTART),
    clone: () => ipcRenderer.send(channels.APP_CLOSE),
  },
  db,
  library: {
    showTrackInFolder: (track: Track) => shell.showItemInFolder(track.path),
    parseUri,
  },
  playlists: {
    resolveM3u: async (path: string): Promise<string[]> =>
      await ipcRenderer.invoke(channels.PLAYLISTS_RESOLVE_M3U, path),
  },
  covers: {
    getCoverAsBase64: (track: Track) =>
      ipcRenderer.invoke(channels.COVER_GET, track.path),
  },
  // TODO: all of the things below should be removed
  path: {
    parse: path.parse,
    resolve: path.resolve,
  },
  shell: {
    openExternal: shell.openExternal,
    openUserDataDirectory: () => shell.openPath(app.getPath('userData')),
  },
};

contextBridge.exposeInMainWorld('ElectronAPI', ElectronAPI);
contextBridge.exposeInMainWorld('MuseeksAPI', MuseeksAPI);

export type ElectronAPI = typeof ElectronAPI;
export type MuseeksAPI = typeof MuseeksAPI;
