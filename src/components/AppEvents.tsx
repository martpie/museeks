import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';

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
    window.addEventListener('dragover', preventNativeDefault, false);
    window.addEventListener('drop', preventNativeDefault, false);

    // Disable the default context menu on production builds
    if (!isDev()) {
      window.addEventListener('contextmenu', preventNativeDefault);
    }

    const unlistenSystemThemeChange = getCurrentWindow().listen(
      'tauri://theme-changed',
      onSystemThemeChange,
    );

    return function cleanup() {
      window.removeEventListener('dragover', preventNativeDefault, false);
      window.removeEventListener('drop', preventNativeDefault, false);

      if (!isDev()) {
        window.removeEventListener('contextmenu', preventNativeDefault);
      }

      unlistenSystemThemeChange.then((u) => u());
    };
  }, []);

  return null;
}

export default AppEvents;
