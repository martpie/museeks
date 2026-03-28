import { useCallback } from 'react';
import Keybinding from 'react-keybinding-component';

import ConfigBridge from '../lib/bridge-config';
import SettingsBridge from '../lib/bridge-settings';
import player from '../lib/player';

/**
 * Handle app-level IPC Navigation events
 */
function GlobalKeyBindings() {
  // App shortcuts (not using global shortcuts API to avoid conflicts
  // with other applications)
  const onKey = useCallback(async (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        await player.playPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        player.setCurrentTime(player.getCurrentTime() - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        player.setCurrentTime(player.getCurrentTime() + 10);
        break;
      case 'Alt': {
        const menuVisible = await ConfigBridge.get('menu_bar_visible');
        if (menuVisible) {
          await SettingsBridge.hideMenu();
        } else {
          await SettingsBridge.showMenu();
        }
        break;
      }
      default:
        break;
    }
  }, []);

  return <Keybinding onKey={onKey} preventInputConflict />;
}

export default GlobalKeyBindings;
