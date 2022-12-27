/**
 * Module in charge of pausing the player when going into sleep
 */

import electron from 'electron';

import channels from '../../shared/lib/ipc-channels';

import ModuleWindow from './module-window';

class PowerMonitorModule extends ModuleWindow {
  async load(): Promise<void> {
    const { powerMonitor } = electron;
    const { window } = this;

    powerMonitor.on('suspend', () => {
      window.webContents.send(channels.PLAYBACK_PAUSE);
    });
  }
}

export default PowerMonitorModule;
