import Player from '../lib/player';
import { browserWindows, config }  from '../lib/app';
import utils from '../utils/utils';

import LibraryActions      from './LibraryActions';
import PlaylistsActions    from './PlaylistsActions';
import ToastsActions       from './ToastsActions';
import NotificationActions from './NotificationActions';
import PlayerActions       from './PlayerActions';
import QueueActions        from './QueueActions';
import SettingsActions     from './SettingsActions';

const globalShortcut = electron.remote.globalShortcut;
const ipcRenderer    = electron.ipcRenderer;

const init = () => {
  // Usual tasks
  LibraryActions.load();
  PlaylistsActions.refresh();
  SettingsActions.check();
  initShortcuts();
  start();

  // Bind player events
  // Audio Events
  Player.getAudio().addEventListener('ended', PlayerActions.next);
  Player.getAudio().addEventListener('error', PlayerActions.audioError);
  Player.getAudio().addEventListener('timeupdate', () => {
    if (Player.isThresholdReached()) {
      LibraryActions.incrementPlayCount(Player.getSrc());
    }
  });

  Player.getAudio().addEventListener('play', async () => {
    ipcRenderer.send('playerAction', 'play');

    const path = decodeURIComponent(Player.getSrc()).replace('file://', '');

    const track = await utils.getMetadata(path);

    ipcRenderer.send('playerAction', 'trackStart', track);

    if(browserWindows.main.isFocused()) return;

    const cover = await utils.fetchCover(track.path);
    NotificationActions.add({
      title: track.title,
      body: `${track.artist}\n${track.album}`,
      icon: cover,
    });
  });

  Player.getAudio().addEventListener('pause', () => {
    ipcRenderer.send('playerAction', 'pause');
  });

  // Listen for main-process events
  ipcRenderer.on('playerAction', (event, reply) => {
    switch(reply) {
      case 'play':
        PlayerActions.play();
        break;
      case 'pause':
        PlayerActions.pause();
        break;
      case 'prev':
        PlayerActions.previous();
        break;
      case 'next':
        PlayerActions.next();
        break;
    }
  });

  // Listen for main-process events
  ipcRenderer.on('close', () => {
    close();
  });

  // Prevent some events
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  }, false);

  window.addEventListener('drop', (e) => {
    e.preventDefault();
  }, false);

  // Remember dimensions and positionning
  const currentWindow = browserWindows.main;

  currentWindow.on('resize', saveBounds);

  currentWindow.on('move', saveBounds);
};

const start = () => {
  ipcRenderer.send('appReady');
};

const restart = () => {
  ipcRenderer.send('appRestart');
};

const close = () => {
  if(config.get('minimizeToTray')) {
    browserWindows.main.hide();
  } else {
    browserWindows.main.destroy();
  }
};

const minimize = () => {
  browserWindows.main.minimize();
};

const maximize = () => {
  browserWindows.main.isMaximized() ? browserWindows.main.unmaximize() : browserWindows.main.maximize();
};

const saveBounds = () => {
  const now = window.performance.now();

  if (now - self.lastFilterSearch < 250) {
    clearTimeout(self.filterSearchTimeOut);
  }

  self.lastFilterSearch = now;

  self.filterSearchTimeOut = setTimeout(() => {
    config.set('bounds', browserWindows.main.getBounds());
    config.saveSync();
  }, 250);
};

const initShortcuts = () => {
  // Global shortcuts - Player
  globalShortcut.register('MediaPlayPause', () => {
    PlayerActions.playToggle();
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    PlayerActions.previous();
  });

  globalShortcut.register('MediaNextTrack', () => {
    PlayerActions.next();
  });
};

export default {
  player        : PlayerActions,
  playlists     : PlaylistsActions,
  queue         : QueueActions,
  library       : LibraryActions,
  settings      : SettingsActions,
  toasts        : ToastsActions,
  notifications : NotificationActions,

  close,
  init,
  initShortcuts,
  maximize,
  minimize,
  saveBounds,
  start,

  app: {
    restart,
  },
};
