/**
 * Module in charge of receiving dialogs requests from the renderer process
 * and returning data if needed
 */

import { dialog, ipcMain } from 'electron';
import messages from '../../shared/lib/ipc-messages';
import ModuleWindow from './module-window';

class DialogsModule extends ModuleWindow {
  async load(): Promise<void> {
    /**
     * Warning when removing files from the library
     */
    ipcMain.handle(messages.LIBRARY_REMOVAL_WARNING, async (_event, tracksLength) => {
      const result = await dialog.showMessageBox(this.window, {
        buttons: ['Cancel', 'Remove'],
        title: 'Remove tracks from library?',
        message: `Are you sure you want to remove ${tracksLength} element(s) from your library?`,
        type: 'warning',
      });

      return result;
    });

    /**
     * Warning when resetting the library
     */
    ipcMain.handle(messages.LIBRARY_RESET_WARNING, async (_event) => {
      const result = await dialog.showMessageBox(this.window, {
        buttons: ['Cancel', 'Reset'],
        title: 'Reset library?',
        message: 'Are you sure you want to reset your library? All your tracks and playlists will be cleared.',
        type: 'warning',
      });

      return result;
    });
  }
}

export default DialogsModule;
