/**
 * Module in charge of pausing the player when going into sleep
 */

import * as electron from 'electron';
import ModuleWindow from './module-window';

class PowerMonitorModule extends ModuleWindow {
  async load () {
    const { powerMonitor } = electron;
    const { window } = this;

    powerMonitor.on('suspend', () => {
      window.webContents.send('playback:pause');
    });
  }
}

export default PowerMonitorModule;
