import { invoke } from '@tauri-apps/api/core';
import { useCallback } from 'react';
import Keybinding from 'react-keybinding-component';

import player from '../lib/player';
import { usePlayerAPI } from '../stores/usePlayerStore';

/**
 * Handle app-level IPC Navigation events
 */
function GlobalKeyBindings() {
  const playerAPI = usePlayerAPI();

  // App shortcuts (not using global shortcuts API to avoid conflicts
  // with other applications)
  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          playerAPI.playPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          playerAPI.jumpTo(player.getCurrentTime() - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          playerAPI.jumpTo(player.getCurrentTime() + 10);
          break;
        case 'Alt':
          await invoke('plugin:app-menu|toggle');
          break;
        default:
          break;
      }
    },
    [playerAPI],
  );

  return <Keybinding onKey={onKey} preventInputConflict />;
}

export default GlobalKeyBindings;
