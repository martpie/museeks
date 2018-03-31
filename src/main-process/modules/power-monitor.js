/**
 * Module in charge of pausing the player when going into sleep
 */

const ModuleWindow = require('./module-window');
const { IPCR_PLAYER_ACTION } = require('../../shared/constants/ipc');


class PowerMonitor extends ModuleWindow {
  constructor(window) {
    super(window);
  }

  load() {
    const { powerMonitor } = require('electron');
    const window = this.window;

    powerMonitor.on('suspend', () => {
      window.webContents.send(IPCR_PLAYER_ACTION, 'pause');
    });
  }
}

module.exports = PowerMonitor;
