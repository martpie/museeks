import { useEffect } from 'react';
import type { IpcRendererEvent } from 'electron';

import player from '../../lib/player';
import { preventNativeDefault } from '../../lib/utils-events';
import SettingsAPI from '../../stores/SettingsAPI';
import channels from '../../../shared/lib/ipc-channels';
import type { Theme } from '../../../shared/types/museeks';
import logger from '../../../shared/lib/logger';

const { ipcRenderer } = window.ElectronAPI;

/**
 * Handle app-level IPC Events init and cleanup
 */
function AppEvents() {
  useEffect(() => {
    // Prevent drop events on the window
    window.addEventListener('dragover', preventNativeDefault, false);
    window.addEventListener('drop', preventNativeDefault, false);

    // Auto-update theme if set to system and the native theme changes
    function updateTheme(_event: IpcRendererEvent, theme: Theme) {
      SettingsAPI.applyThemeToUI(theme);
    }

    ipcRenderer.on(channels.THEME_APPLY, updateTheme);

    // Support for multiple audio output
    async function updateOutputDevice() {
      try {
        await player.setOutputDevice('default');
      } catch (err) {
        logger.warn(err);
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', updateOutputDevice);

    return function cleanup() {
      window.removeEventListener('dragover', preventNativeDefault, false);
      window.removeEventListener('drop', preventNativeDefault, false);

      ipcRenderer.off(channels.THEME_APPLY, updateTheme);

      navigator.mediaDevices.removeEventListener(
        'devicechange',
        updateOutputDevice,
      );
    };
  }, []);

  return null;
}

export default AppEvents;
