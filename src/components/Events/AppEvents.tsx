import { useEffect } from 'react';

import player from '../../lib/player';
import { isDev, preventNativeDefault } from '../../lib/utils-events';
// import SettingsAPI from '../../stores/SettingsAPI';
// import type { Theme } from '../../types/museeks';
import { logAndNotifyError } from '../../lib/utils';

/**
 * Handle app-level IPC Events init and cleanup
 */
function AppEvents() {
  useEffect(() => {
    // Prevent drop events on the window
    window.addEventListener('dragover', preventNativeDefault, false);
    window.addEventListener('drop', preventNativeDefault, false);

    // Disable the default context menu on production builds
    if (!isDev()) {
      window.addEventListener('contextmenu', preventNativeDefault);
    }

    // TODO: fix that https://github.com/tauri-apps/tauri/issues/5279
    // Auto-update theme if set to system and the native theme changes
    // function updateTheme(_event: IpcRendererEvent, theme: unknown) {
    //   SettingsAPI.applyThemeToUI(theme as Theme);
    // }

    // ipcRenderer.on(channels.THEME_APPLY, updateTheme);

    // Support for multiple audio output
    async function updateOutputDevice() {
      try {
        await player.setOutputDevice('default');
      } catch (err) {
        logAndNotifyError(err);
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', updateOutputDevice);

    return function cleanup() {
      window.removeEventListener('dragover', preventNativeDefault, false);
      window.removeEventListener('drop', preventNativeDefault, false);

      if (!isDev()) {
        window.removeEventListener('contextmenu', preventNativeDefault);
      }

      // ipcRenderer.off(channels.THEME_APPLY, updateTheme);

      navigator.mediaDevices.removeEventListener(
        'devicechange',
        updateOutputDevice,
      );
    };
  }, []);

  return null;
}

export default AppEvents;
