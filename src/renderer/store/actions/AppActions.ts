import os from 'os';
import electron from 'electron';

import Player from '../../lib/player';
import { browserWindows, config } from '../../lib/app';
import * as utils from '../../lib/utils';
import * as coverUtils from '../../../shared/lib/utils-cover';
import channels from '../../../shared/lib/ipc-channels';
import { Theme } from '../../../shared/types/museeks';

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
      await LibraryActions.incrementPlayCount(Player.getSrc());
    }
  });

  // Should be moved to PlayerActions.play at some point, currently here due to
  // how Audio works
  Player.getAudio().addEventListener('play', async () => {
    ipcRenderer.send(channels.PLAYBACK_PLAY);

    // HACK, on win32, a prefix slash is weirdly added
    let trackPath = Player.getSrc();

    if (os.platform() === 'win32') {
      trackPath = trackPath.replace('file:///', '');
    } else {
      trackPath = trackPath.replace('file://', '');
    }

    trackPath = decodeURIComponent(trackPath);

    const track = await utils.getMetadata(trackPath);

    ipcRenderer.send(channels.PLAYBACK_TRACK_CHANGE, track);

    if (browserWindows.main.isFocused()) return;

    const cover = await coverUtils.fetchCover(track.path);

    NotificationsActions.add(track.title, {
      body: `${track.artist}\n${track.album}`,
      icon: cover || '',
    });
  });

  Player.getAudio().addEventListener('pause', () => {
    ipcRenderer.send(channels.PLAYBACK_PAUSE);
  });

  navigator.mediaDevices.addEventListener('devicechange', async () => {
    try {
      await Player.setOutputDevice('default');
    } catch (err) {
      console.warn(err);
    }
  });

  // Listen for main-process events
  ipcRenderer.on(channels.PLAYBACK_PLAY, () => {
    if (Player.getSrc()) {
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
