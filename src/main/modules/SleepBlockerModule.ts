/**
 * Module in charge of preventing the computer to go to sleep
 */

import { powerSaveBlocker, ipcMain, IpcMainEvent } from 'electron';

import channels from '../../shared/lib/ipc-channels';

import ModuleWindow from './BaseWindowModule';

export default class SleepBlocker extends ModuleWindow {
  protected sleepBlockerID: number;
  protected enabled: boolean;

  constructor(window: Electron.BrowserWindow) {
    super(window);

    this.enabled = false;
    this.sleepBlockerID = 0;
    this.platforms = ['win32', 'darwin', 'linux'];
  }

  onStartPlayback = (): void => {
    if (this.enabled && !powerSaveBlocker.isStarted(this.sleepBlockerID)) {
      // or 'prevent-display-sleep'
      this.sleepBlockerID = powerSaveBlocker.start('prevent-app-suspension');
    }
  };

  onStopPlayback = (): void => {
    if (powerSaveBlocker.isStarted(this.sleepBlockerID)) {
      powerSaveBlocker.stop(this.sleepBlockerID);
    }
  };

  toggleSleepBlocker = (_event: IpcMainEvent, value: boolean): void => {
    this.enabled = value;
  };

  async load(): Promise<void> {
    ipcMain.on(channels.SETTINGS_TOGGLE_SLEEP_BLOCKER, this.toggleSleepBlocker);
    ipcMain.on(channels.PLAYBACK_PLAY, this.onStartPlayback);
    ipcMain.on(channels.PLAYBACK_PAUSE, this.onStopPlayback);
    ipcMain.on(channels.PLAYBACK_STOP, this.onStopPlayback);
  }
}
