import { ipcRenderer } from 'electron';

import history from '../../lib/history';
import channels from '../../../shared/lib/ipc-channels';
import { Theme } from '../../../shared/types/museeks';

import logger from '../../../shared/lib/logger';
import * as LibraryActions from './LibraryActions';
import * as PlaylistsActions from './PlaylistsActions';
import * as PlayerActions from './PlayerActions';
import * as SettingsActions from './SettingsActions';

const init = async (): Promise<void> => {
  // There's some trouble with React StrictMode: player gets created in preload,
  // so events below get attached twice as React.render gets called twice.
  // Maybe the player should not be instantiated in preload?
  if (window.__museeks.__instantiated) {
    return;
  } else {
    window.__museeks.__instantiated = true;
  }

  // Usual tasks
  await Promise.all([
    SettingsActions.check(),
    LibraryActions.refresh(),
    PlaylistsActions.refresh(),
    PlayerActions.init(window.__museeks.player),
  ]);

  // Tell the main process to show the window
  window.__museeks.app.ready();

  // Support for multiple audio output
  navigator.mediaDevices.addEventListener('devicechange', async () => {
    try {
      await window.__museeks.player.setOutputDevice('default');
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
    history.push('/library');
  });

  ipcRenderer.on(channels.MENU_GO_TO_PLAYLISTS, () => {
    history.push('/playlists');
  });

  ipcRenderer.on(channels.MENU_JUMP_TO_PLAYING_TRACK, () => {
    PlayerActions.jumpToPlayingTrack();
  });

  // Prevent drop events on the window
  window.addEventListener('dragover', (e) => e.preventDefault(), false);

  window.addEventListener('drop', (e) => e.preventDefault(), false);
};

export default {
  init,
};
