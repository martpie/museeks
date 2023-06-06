import { ipcRenderer } from 'electron';

import channels from '../../../shared/lib/ipc-channels';
import { Theme } from '../../../shared/types/museeks';
import logger from '../../../shared/lib/logger';
import router from '../../views/router';
import usePlayerStore from '../../stores/usePlayerStore';

import * as LibraryActions from './LibraryActions';
import * as SettingsActions from './SettingsActions';

const init = async (): Promise<void> => {
  // There's some trouble with React StrictMode: player gets created in preload,
  // so events below get attached twice as React.render gets called twice.
  // Maybe the player should not be instantiated in preload?
  if (window.MuseeksAPI.__instantiated) {
    return;
  } else {
    window.MuseeksAPI.__instantiated = true;
  }

  // Usual tasks
  await Promise.all([
    SettingsActions.check(),
    LibraryActions.refresh(),
    usePlayerStore.getState().api.init(window.MuseeksAPI.player),
  ]);

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
    SettingsActions.applyThemeToUI(theme);
  });

  // Shortcuts from the application menu
  ipcRenderer.on(channels.MENU_GO_TO_LIBRARY, () => {
    router.navigate('/library');
  });

  ipcRenderer.on(channels.MENU_GO_TO_PLAYLISTS, () => {
    router.navigate('/playlists');
  });

  ipcRenderer.on(channels.MENU_JUMP_TO_PLAYING_TRACK, () => {
    usePlayerStore.getState().api.jumpToPlayingTrack();
  });

  // Prevent drop events on the window
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);
};

export default {
  init,
};
