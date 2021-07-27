/**
 * Module in charge of preventing the computer to go to sleep
 */

import { powerSaveBlocker, ipcMain } from 'electron';

import messages from '../../shared/lib/ipc-messages';
import ModuleWindow from './module-window';

class SleepBlocker extends ModuleWindow {
  protected sleepBlockerId: number;
  protected enabled: boolean;

  constructor(window: Electron.BrowserWindow) {
    super(window);

    this.enabled = false;
    this.sleepBlockerId = 0;
    this.platforms = ['win32', 'darwin', 'linux'];
  }

  onStartPlayback = (_event: Event): void => {
    if (this.enabled && !powerSaveBlocker.isStarted(this.sleepBlockerId)) {
      // or 'prevent-display-sleep'
      this.sleepBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    }
  };

  onStopPlayback = (_event: Event): void => {
    if (powerSaveBlocker.isStarted(this.sleepBlockerId)) {
      powerSaveBlocker.stop(this.sleepBlockerId);
    }
  };

  toggleSleepBlocker = (_event: Event, value: boolean): void => {
    this.enabled = value;
  };

  async load(): Promise<void> {
    ipcMain.on(messages.SETTINGS_TOGGLE_SLEEP_BLOCKER, this.toggleSleepBlocker);
    ipcMain.on(messages.PLAYBACK_PLAY, this.onStartPlayback);
    ipcMain.on(messages.PLAYBACK_PAUSE, this.onStopPlayback);
    ipcMain.on(messages.PLAYBACK_STOP, this.onStopPlayback);
  }
}

export default SleepBlocker;
