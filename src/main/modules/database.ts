// import { ipcMain } from 'electron';

// import channels from '../../shared/lib/ipc-channels';
// import { Track } from '../../shared/types/museeks';
// import * as db from '../../preload/db';
import ModuleWindow from './module-window';

/**
 * Module in charge of interacting with the DB from the Renderer process.
 *
 * TODO: a LOT of code from the UI can be ported here once all the events are
 * created
 */
export default class IPCDatabaseModule extends ModuleWindow {
  async load(): Promise<void> {
    // ipcMain.handle(channels.DB_RESET, () => db.reset);
    // ipcMain.handle(channels.TRACKS_LOAD_ALL, () => db.loadAllTracks);
    // ipcMain.handle(channels.TRACKS_FIND_BY_ID, (_, trackIDs: string[]) => db.findTracksByID(trackIDs));
    // ipcMain.handle(channels.TRACK_FIND_BY_ID, (_, trackID: string) => db.findTrackByID(trackID));
    // ipcMain.handle(channels.TRACK_FIND_BY_PATH, (_, path: string) => db.findTrackByPath(path));
    // ipcMain.handle(channels.TRACKS_INSERT, (_, track: Track) => db.insertTrack(track));
  }
}
