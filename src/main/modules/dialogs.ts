/**
 * Module in charge of receiving dialogs requests from the renderer process
 * and returning data if needed
 */

import { dialog, ipcMain } from 'electron';
import channels from '../../shared/lib/ipc-channels';
import ModuleWindow from './module-window';

class DialogsModule extends ModuleWindow {
  async load(): Promise<void> {
    /**
     * showMessageBox
     */
    ipcMain.handle(channels.DIALOG_MESSAGE_BOX, async (_event, options: Electron.MessageBoxOptions) => {
      const result = await dialog.showMessageBox(this.window, options);

      return result;
    });

    /**
     * showOpenDialog
     */
    ipcMain.handle(channels.DIALOG_OPEN, async (_event, options: Electron.OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(options);

      return result;
    });
  }
}

export default DialogsModule;
