import electron from 'electron';

import Player from '../../lib/player';
import { browserWindows, config } from '../../lib/app';
import history from '../../lib/history';
import channels from '../../../shared/lib/ipc-channels';
import { Theme } from '../../../shared/types/museeks';

import logger from '../../../shared/lib/logger';
import * as LibraryActions from './LibraryActions';
import * as PlaylistsActions from './PlaylistsActions';
import * as NotificationsActions from './NotificationsActions';
import * as PlayerActions from './PlayerActions';
import * as SettingsActions from './SettingsActions';

const { ipcRenderer } = electron;

let lastSaveBounds = 0;
let saveBoundsTimeout: number | null = null;

const saveBounds = async (): Promise<void> => {
  const now = window.performance.now();

  if (now - lastSaveBounds < 250 && saveBoundsTimeout) {
    clearTimeout(saveBoundsTimeout);
  }

  lastSaveBounds = now;

  saveBoundsTimeout = window.setTimeout(async () => {
    config.set('bounds', browserWindows.main.getBounds());
    config.save();
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
  Player.getAudio().addEventListener('ended', PlayerActions.next);
  Player.getAudio().addEventListener('error', PlayerActions.audioError);
  Player.getAudio().addEventListener('timeupdate', async () => {
    if (Player.isThresholdReached()) {
      const track = Player.getTrack();
      if (track) await LibraryActions.incrementPlayCount(track.path);
    }
  });

  // Should be moved to PlayerActions.play at some point, currently here due to
  // how Audio works
  Player.getAudio().addEventListener('play', async () => {
    ipcRenderer.send(channels.PLAYBACK_PLAY);

    const track = Player.getTrack();

    if (!track) return;

    ipcRenderer.send(channels.PLAYBACK_TRACK_CHANGE, track);

    if (browserWindows.main.isFocused()) return;

    const cover = await ipcRenderer.invoke(channels.COVER_GET, track.path);

    NotificationsActions.add(track.title, {
      body: `${track.artist}\n${track.album}`,
      icon: cover || '',
    });
  });

  Player.getAudio().addEventListener('pause', () => {
    ipcRenderer.send(channels.PLAYBACK_PAUSE);
  });

  // Support MediaSession (mpris, macOS player controls etc)...
  // Media Session support
  Player.getAudio().addEventListener('loadstart', async () => {
    const track = Player.getTrack();
    if (track) {
      const cover = await ipcRenderer.invoke(channels.COVER_GET, track.path, false, true);

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist.join(', '),
        album: track.album,
        artwork: cover ? [{ src: cover }] : undefined,
      });
    }
  });

  Player.getAudio().addEventListener('play', async () => {
    navigator.mediaSession.playbackState = 'playing';
  });

  Player.getAudio().addEventListener('pause', async () => {
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
      await Player.setOutputDevice('default');
    } catch (err) {
      logger.warn(err);
    }
  });

  // Listen for main-process events
  ipcRenderer.on(channels.PLAYBACK_PLAY, () => {
    if (Player.getTrack()) {
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
  const currentWindow = browserWindows.main;

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
  browserWindows.main.minimize();
};

const maximize = (): void => {
  const mainWindow = browserWindows.main;

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
