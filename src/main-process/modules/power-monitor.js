/**
 * Module in charge of pausing the player when going into sleep
 */

const ModuleWindow = require('./module-window');


class PowerMonitor extends ModuleWindow {
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
