import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import player from '../lib/player';
import { logAndNotifyError } from '../lib/utils';
import { isDev, preventNativeDefault } from '../lib/utils-events';
import SettingsAPI from '../stores/SettingsAPI';

function onSystemThemeChange({ payload }: { payload: string }) {
  SettingsAPI.applyThemeToUI(payload);
}

/**
 * Handle app-level IPC Events init and cleanup
 */
function AppEvents() {
  useEffect(() => {
    // Prevent drop events on the window
    globalThis.addEventListener('dragover', preventNativeDefault, false);
    globalThis.addEventListener('drop', preventNativeDefault, false);

    // Disable the default context menu on production builds
    if (!isDev()) {
      globalThis.addEventListener('contextmenu', preventNativeDefault);
    }

    // TODO: fix that https://github.com/tauri-apps/tauri/issues/5279
    // Auto-update theme if set to system and the native theme changes
    // function updateTheme(_event: IpcRendererEvent, theme: unknown) {
    //   SettingsAPI.applyThemeToUI(theme as Theme);
    // }
    const unlistenSystemThemeChange = getCurrentWindow().listen(
      'tauri://theme-changed',
      onSystemThemeChange,
    );

    // Support for multiple audio output
    async function updateOutputDevice() {
      try {
        await player.setOutputDevice('default');
      } catch (error) {
        logAndNotifyError(error);
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', updateOutputDevice);

    return function cleanup() {
      globalThis.removeEventListener('dragover', preventNativeDefault, false);
      globalThis.removeEventListener('drop', preventNativeDefault, false);

      if (!isDev()) {
        globalThis.removeEventListener('contextmenu', preventNativeDefault);
      }

      unlistenSystemThemeChange.then((u) => u());

      navigator.mediaDevices.removeEventListener(
        'devicechange',
        updateOutputDevice,
      );
    };
  }, []);

  return null;
}

export default AppEvents;
