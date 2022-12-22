// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import remote from '@electron/remote';
import TeenyConf from 'teeny-conf';
import { Config, PlaylistModel, TrackModel } from '../museeks';

declare global {
  interface Window {
    __museeks: {
      platform: NodeJS.Platform;
      version: string;
      browserwindow: Electron.CrossProcessExports.BrowserWindow;
      config: TeenyConf<Config>;
      db: {
        Track: TrackModel;
        Playlist: PlaylistModel;
      };
      playlists: {
        resolveM3u: (path: string) => Promise<string[]>;
      };
      remote: typeof remote;
    };
  }
}

export {};
