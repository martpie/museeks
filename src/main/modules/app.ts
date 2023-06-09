/**
 * Module in charge of handling the different window behavior based on platforms
 * and tray options
 */

import os from 'os';

import { ipcMain, app } from 'electron';
import TeenyConf from 'teeny-conf';

import logger from '../../shared/lib/logger';
import channels from '../../shared/lib/ipc-channels';
import { Config } from '../../shared/types/museeks';

import ModuleWindow from './module-window';

export default class AppModule extends ModuleWindow {
  protected config: TeenyConf<Config>;
  protected forceQuit: boolean;

  constructor(window: Electron.BrowserWindow, config: TeenyConf<Config>) {
    super(window);

    this.config = config;
    this.forceQuit = false;
  }

  async load(): Promise<void> {
    // Make the app a single-instance app
    this.ensureSingleInstance();

    // Shows app only once it is loaded (avoid initial white flash)
    ipcMain.once(channels.APP_READY, () => {
      if (this.window) {
        this.window.show();
      }
    });

    // Restart the app with the same arguments
    ipcMain.on(channels.APP_RESTART, () => {
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      app.exit(0);
    });

    // Prevent the window to be closed, hide it instead (to continue audio playback)
    this.window.on('close', (e) => {
      this.close(e);
    });

    ipcMain.on(channels.APP_CLOSE, (e) => {
      this.close(e);
    });

    // Click on the dock icon to show the app again on macOS
    app.on('activate', () => {
      if (this.window) {
        this.window.show();
        this.window.focus();
      }
    });

    // Small hack to check on MacOS if the dock close action has been clicked
    // https://stackoverflow.com/questions/35008347/electron-close-w-x-vs-right-click-dock-and-quit#35782702
    app.on('before-quit', () => {
      this.forceQuit = true;
    });
  }

  close(e: Electron.Event): void {
    this.config.reload(); // HACKY
    const minimizeToTray = this.config.get('minimizeToTray');

    if (this.forceQuit || (!minimizeToTray && os.platform() !== 'darwin')) {
      app.quit();
      this.window.destroy();
    } else {
      e.preventDefault();
      // Should we minimize on Linux in case of the Tray not being displayed?
      this.window.hide();
    }
  }

  ensureSingleInstance(): void {
    const gotTheLock = app.requestSingleInstanceLock();

    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (this.window) {
        if (this.window.isMinimized()) this.window.restore();
        this.window.focus();
      }
    });

    if (!gotTheLock) {
      logger.info(
        'Another instance of Museeks is already running, quitting...',
      );
      app.quit();
    }
  }
}
