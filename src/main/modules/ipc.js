/**
 * Module in charge of communicating with the render process, especially
 * in TracksList.
 *
 * TODO parts of this file should return to ui/, as content menus can now be
 * made async without blocking the rendering process
 */

const { ipcMain, app } = require('electron');

const ModuleWindow = require('./module-window');


class IpcModule extends ModuleWindow {
  constructor(window, config) {
    super(window);

    this.config = config;
    this.instance = {};
    this.forceQuit = false;
  }

  load() {
    ipcMain.on('app:restart', () => {
      app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] });
      app.exit(0);
    });


    this.window.on('closed', () => {
      // Dereference the window object
      this.window = null;
    });

    // Prevent the window to be closed, hide it instead (to continue audio playback)
    this.window.on('close', (e) => {
      this.close(e);
    });
    ipcMain.on('app:close', (e) => {
      this.close(e);
    });

    // Small hack to check on MacOS if the dock close action has been clicked
    // https://stackoverflow.com/questions/35008347/electron-close-w-x-vs-right-click-dock-and-quit#35782702
    app.on('before-quit', () => {
      this.forceQuit = true;
    });
  }

  close(e) {
    this.config.reload(); // HACKY
    const minimizeToTray = this.config.get('minimizeToTray');

    if (this.forceQuit || !minimizeToTray) {
      app.quit();
      this.window.destroy();
    } else {
      e.preventDefault();
      this.window.hide();
    }
  }
}

module.exports = IpcModule;
