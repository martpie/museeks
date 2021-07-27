/**
 * Module in charge of pausing the player when going into sleep
 */

import electron from 'electron';

import messages from '../../shared/lib/ipc-messages';
import ModuleWindow from './module-window';

class PowerMonitorModule extends ModuleWindow {
  async load(): Promise<void> {
    const { powerMonitor } = electron;
    const { window } = this;

    powerMonitor.on('suspend', () => {
      window.webContents.send(messages.PLAYBACK_PAUSE);
    });
  }
}

export default PowerMonitorModule;
