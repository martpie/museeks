/**
 * Module in charge of pausing the player when going into sleep
 */

const Module = require('./module');
const constants = require('../constants');


class PowerMonitor extends Module {
  static get PLATFORMS() {
    return ['win32', 'linux', 'darwin'];
  }

  static get LOAD_AT() {
    return constants.ON_BROWSERWINDOW_READY;
  }

  constructor(window) {
    super(window);
  }

  load() {
    const { powerMonitor } = require('electron');
    const window = this.window;

    powerMonitor.on('suspend', () => {
      window.webContents.send('playerAction', 'pause');
    });
  }
}

module.exports = PowerMonitor;
