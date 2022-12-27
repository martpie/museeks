import path from 'path';

import { app, dialog, ipcMain } from 'electron';
import * as m3u from 'm3ujs';

import channels from '../../shared/lib/ipc-channels';
import logger from '../../shared/lib/logger';

import ModuleWindow from './module-window';

/**
 * Module in charge of returning the cover data for a given track
 */
class IPCPlaylistsModule extends ModuleWindow {
  async load(): Promise<void> {
    ipcMain.on(channels.PLAYLIST_EXPORT, async (_e, name: string, tracksPath: string[]) => {
      const { filePath } = await dialog.showSaveDialog(this.window, {
        title: 'Export playlist',
        defaultPath: path.resolve(app.getPath('music'), name),
        filters: [
          {
            extensions: ['m3u'],
            name: 'random',
          },
        ],
      });

      if (filePath) {
        try {
          const playlistExport = new m3u.Playlist(
            new m3u.TypeEXTM3U((entry) => {
              if (entry instanceof m3u.Mp3Entry) {
                return `${entry.artist} - ${entry.album} - ${entry.track} - ${entry.title}`;
              }
              return entry.displayName;
            })
          );

          tracksPath.forEach((trackPath) => {
            try {
              playlistExport.add(new m3u.Mp3Entry(trackPath));
            } catch (err) {
              logger.warn(err);
            }
          });

          playlistExport.write(filePath);
        } catch (err: unknown) {
          logger.warn(err);
          if (err instanceof Error) {
            dialog.showErrorBox(`An error occured when exporting the playlist "${name}"`, err.message);
          } else {
            dialog.showErrorBox(`An error occured when exporting the playlist "${name}"`, 'Unknown error');
          }
        }
      }
    });
  }
}

export default IPCPlaylistsModule;
