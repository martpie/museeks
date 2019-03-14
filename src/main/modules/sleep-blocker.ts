/**
 * Module in charge of preventing the computer to go to sleep
 */

import { powerSaveBlocker, ipcMain } from 'electron';

import ModuleWindow from './module-window';

class SleepBlocker extends ModuleWindow {
  protected sleepBlockerId: number;
  protected enabled: boolean;

  constructor (window: Electron.BrowserWindow) {
    super(window);

    this.enabled = false;
    this.sleepBlockerId = 0;
    this.platforms = ['win32', 'darwin', 'linux'];
  }

  onStartPlayback = (_event: Event) => {
    if (this.enabled && !powerSaveBlocker.isStarted(this.sleepBlockerId)) {
      // or 'prevent-display-sleep'
      this.sleepBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    }
  }

  onStopPlayback = (_event: Event) => {
    if (powerSaveBlocker.isStarted(this.sleepBlockerId)) {
      powerSaveBlocker.stop(this.sleepBlockerId);
    }
  }

  toggleSleepBlocker = (_event: Event, value: boolean) => {
    this.enabled = value;
  }

  async load () {
    ipcMain.on('settings:toggleSleepBlocker', this.toggleSleepBlocker);
    ipcMain.on('playback:play', this.onStartPlayback);
    ipcMain.on('playback:pause', this.onStopPlayback);
    ipcMain.on('playback:stop', this.onStopPlayback);
  }
}

export default SleepBlocker;
