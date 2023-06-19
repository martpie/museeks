import channels from '../../shared/lib/ipc-channels';
import { Theme } from '../../shared/types/museeks';
import logger from '../../shared/lib/logger';

import SettingsAPI from './SettingsAPI';

const { ipcRenderer } = window.ElectronAPI;

const init = async (): Promise<void> => {
  // There's some trouble with React StrictMode: player gets created in preload,
  // so events below get attached twice as React.render gets called twice.
  // Maybe the player should not be instantiated in preload?
  if (window.MuseeksAPI.__instantiated) {
    return;
  } else {
    window.MuseeksAPI.__instantiated = true;
  }

  await SettingsAPI.check();

  // Tell the main process to show the window
  window.MuseeksAPI.app.ready();

  // Support for multiple audio output
  navigator.mediaDevices.addEventListener('devicechange', async () => {
    try {
      await window.MuseeksAPI.player.setOutputDevice('default');
    } catch (err) {
      logger.warn(err);
    }
  });

  // Auto-update theme if set to system and the native theme changes
  ipcRenderer.on(channels.THEME_APPLY, (_event, theme: Theme) => {
    SettingsAPI.applyThemeToUI(theme);
  });

  // Prevent drop events on the window
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);
};

// Should we use something else to harmonize between zustand and non-store APIs?
const AppAPI = {
  init,
};

export default AppAPI;
