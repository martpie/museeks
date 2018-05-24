/**
 * Module in charge of pausing the player when going into sleep
 */

const electron = require('electron');
const ModuleWindow = require('./module-window');


class PowerMonitorModule extends ModuleWindow {
  load() {
    const { powerMonitor } = electron;
    const { window } = this;

    powerMonitor.on('suspend', () => {
      window.webContents.send('playback:pause');
    });
  }
}

module.exports = PowerMonitorModule;
