/**
 * Module in charge of preventing the computer to go to sleep
 */

import { powerSaveBlocker, ipcMain } from 'electron';

import ModuleWindow from './module-window';

type PowerSaveBlockerMode = 'prevent-app-suspension' | 'prevent-display-sleep';

class ThumbarModule extends ModuleWindow {
  protected sleepBlockerId: number | null;

  constructor (window: Electron.BrowserWindow) {
    super(window);

    this.sleepBlockerId = null;
    this.platforms = ['win32'];
  }

  load () {
    ipcMain.on('settings:toggleSleepBlocker', (_e: Event, toggle: boolean, mode: PowerSaveBlockerMode) => {
      if (toggle) {
        this.sleepBlockerId = powerSaveBlocker.start(mode);
      } else {
        if (this.sleepBlockerId) {
          powerSaveBlocker.stop(this.sleepBlockerId);
        }
      }
    });
  }
}

export default ThumbarModule;
