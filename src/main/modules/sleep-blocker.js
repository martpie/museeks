/**
 * Module in charge of preventing the computer to go to sleep
 */

const { powerSaveBlocker, ipcMain } = require('electron');

const ModuleWindow = require('./module-window');


class ThumbarModule extends ModuleWindow {
  constructor(window) {
    super(window);
    this.platforms = ['win32'];
  }

  load() {
    ipcMain.on('settings:toggleSleepBlocker', (event, toggle, mode) => {
      if (toggle) {
        this.instance.sleepBlockerId = powerSaveBlocker.start(mode);
      } else {
        powerSaveBlocker.stop(this.instance.sleepBlockerId);
        delete (this.instance.sleepBlockerId);
      }
    });
  }
}


module.exports = ThumbarModule;
