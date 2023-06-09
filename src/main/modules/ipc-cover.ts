import { ipcMain } from 'electron';

import channels from '../../shared/lib/ipc-channels';
import { fetchCover } from '../lib/utils-cover';

import ModuleWindow from './module-window';

/**
 * Module in charge of returning the cover data for a given track
 */
export default class IPCCoverModule extends ModuleWindow {
  async load(): Promise<void> {
    ipcMain.handle(
      channels.COVER_GET,
      (_e, path: string): Promise<string | null> => {
        return fetchCover(path, false, true);
      },
    );
  }
}
