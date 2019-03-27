/**
 * Module in charge of communicating with the render process, especially
 * in TracksList.
 *
 * TODO parts of this file should return to ui/, as content menus can now be
 * made async without blocking the rendering process
 */

import { ipcMain, app } from 'electron';
import * as os from 'os';

import ModuleWindow from './module-window';
import ConfigModule from './config';

class IpcModule extends ModuleWindow {
  config: ConfigModule;
  forceQuit: boolean;

  constructor (window: Electron.BrowserWindow, config: ConfigModule) {
    super(window);

    this.config = config;
    this.forceQuit = false;
  }

  async load () {
    ipcMain.on('app:restart', () => {
      app.relaunch({ args: ['process.argv.slice(1)', '--relaunch'] });
      app.exit(0);
    });

    this.window.on('closed', () => {
      // Dereference the window object
      // this.window = null;
    });

    // Prevent the window to be closed, hide it instead (to continue audio playback)
    this.window.on('close', (e: Event) => {
      this.close(e);
    });
    ipcMain.on('app:close', (e: Event) => {
      this.close(e);
    });

    // Small hack to check on MacOS if the dock close action has been clicked
    // https://stackoverflow.com/questions/35008347/electron-close-w-x-vs-right-click-dock-and-quit#35782702
    app.on('before-quit', () => {
      this.forceQuit = true;
    });
  }

  close (e: Event) {
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
}

export default IpcModule;
