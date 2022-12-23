import { ipcRenderer } from 'electron';

import history from '../../lib/history';
import channels from '../../../shared/lib/ipc-channels';
import { Theme } from '../../../shared/types/museeks';

import logger from '../../../shared/lib/logger';
import * as LibraryActions from './LibraryActions';
import * as PlaylistsActions from './PlaylistsActions';
import * as NotificationsActions from './NotificationsActions';
import * as PlayerActions from './PlayerActions';
import * as SettingsActions from './SettingsActions';

let lastSaveBounds = 0;
let saveBoundsTimeout: number | null = null;

const saveBounds = async (): Promise<void> => {
  const now = window.performance.now();

  if (now - lastSaveBounds < 250 && saveBoundsTimeout) {
    clearTimeout(saveBoundsTimeout);
  }

  lastSaveBounds = now;

  saveBoundsTimeout = window.setTimeout(async () => {
    window.__museeks.config.set('bounds', window.__museeks.browserwindow.getBounds());
    window.__museeks.config.save();
  }, 250);
};

const init = async (): Promise<void> => {
  // Usual tasks
  await SettingsActions.check();
  await LibraryActions.refresh();
  await PlaylistsActions.refresh();

  // Tell the main process to show the window
  ipcRenderer.send(channels.APP_READY);

  // Bind player events
  // Audio Events
  window.__museeks.player.getAudio().addEventListener('ended', PlayerActions.next);
  window.__museeks.player.getAudio().addEventListener('error', PlayerActions.audioError);
  window.__museeks.player.getAudio().addEventListener('timeupdate', async () => {
    if (window.__museeks.player.isThresholdReached()) {
      const track = window.__museeks.player.getTrack();
      if (track) await LibraryActions.incrementPlayCount(track.path);
    }
  });

  // Should be moved to PlayerActions.play at some point, currently here due to
  // how Audio works
  window.__museeks.player.getAudio().addEventListener('play', async () => {
    ipcRenderer.send(channels.PLAYBACK_PLAY);

    const track = window.__museeks.player.getTrack();

    if (!track) return;

    ipcRenderer.send(channels.PLAYBACK_TRACK_CHANGE, track);

    if (window.__museeks.browserwindow.isFocused()) return;

    const cover = await window.__museeks.covers.getCoverAsBase64(track);

    NotificationsActions.add(track.title, {
      body: `${track.artist}\n${track.album}`,
      icon: cover || '',
    });
  });

  window.__museeks.player.getAudio().addEventListener('pause', () => {
    ipcRenderer.send(channels.PLAYBACK_PAUSE);
  });

  // Support MediaSession (mpris, macOS player controls etc)...
  // Media Session support
  window.__museeks.player.getAudio().addEventListener('loadstart', async () => {
    const track = window.__museeks.player.getTrack();
    if (track) {
      const cover = await window.__museeks.covers.getCoverAsBase64(track);

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist.join(', '),
        album: track.album,
        artwork: cover ? [{ src: cover }] : undefined,
      });
    }
  });

  window.__museeks.player.getAudio().addEventListener('play', async () => {
    navigator.mediaSession.playbackState = 'playing';
  });

  window.__museeks.player.getAudio().addEventListener('pause', async () => {
    navigator.mediaSession.playbackState = 'paused';
  });

  navigator.mediaSession.setActionHandler('play', async () => {
    PlayerActions.play();
  });

  navigator.mediaSession.setActionHandler('pause', async () => {
    PlayerActions.pause();
  });

  navigator.mediaSession.setActionHandler('previoustrack', async () => {
    PlayerActions.previous();
  });

  navigator.mediaSession.setActionHandler('nexttrack', async () => {
    PlayerActions.next();
  });

  // Support for multiple audio output
  navigator.mediaDevices.addEventListener('devicechange', async () => {
    try {
      await window.__museeks.player.setOutputDevice('default');
    } catch (err) {
      logger.warn(err);
    }
  });

  // Listen for main-process events
  ipcRenderer.on(channels.PLAYBACK_PLAY, () => {
    if (window.__museeks.player.getTrack()) {
      PlayerActions.play();
    } else {
      PlayerActions.start();
    }
  });

  ipcRenderer.on(channels.PLAYBACK_PAUSE, () => {
    PlayerActions.pause();
  });

  ipcRenderer.on(channels.PLAYBACK_PLAYPAUSE, () => {
    PlayerActions.playPause();
  });

  ipcRenderer.on(channels.PLAYBACK_PREVIOUS, () => {
    PlayerActions.previous();
  });

  ipcRenderer.on(channels.PLAYBACK_NEXT, () => {
    PlayerActions.next();
  });

  ipcRenderer.on(channels.PLAYBACK_STOP, () => {
    PlayerActions.stop();
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

  // Prevent some events
  window.addEventListener(
    'dragover',
    (e) => {
      e.preventDefault();
    },
    false
  );

  window.addEventListener(
    'drop',
    (e) => {
      e.preventDefault();
    },
    false
  );

  // Remember dimensions and positionning
  const currentWindow = window.__museeks.browserwindow;

  currentWindow.on('resize', saveBounds);
  currentWindow.on('move', saveBounds);
};

const restart = (): void => {
  ipcRenderer.send(channels.APP_RESTART);
};

const close = (): void => {
  ipcRenderer.send(channels.APP_CLOSE);
};

const minimize = (): void => {
  window.__museeks.browserwindow.minimize();
};

const maximize = (): void => {
  const mainWindow = window.__museeks.browserwindow;

  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
};

export default {
  close,
  init,
  maximize,
  minimize,
  saveBounds,
  restart,
};
