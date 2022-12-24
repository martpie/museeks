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
  await Promise.all([SettingsActions.check(), LibraryActions.refresh(), PlaylistsActions.refresh()]);

  // Tell the main process to show the window
  window.__museeks.ready();

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
    const track = window.__museeks.player.getTrack();

    if (!track) throw new Error('Track is undefined');

    ipcRenderer.send(channels.PLAYBACK_PLAY, track ?? null);
    ipcRenderer.send(channels.PLAYBACK_TRACK_CHANGE, track);
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
};

const restart = (): void => {
  ipcRenderer.send(channels.APP_RESTART);
};

const close = (): void => {
  ipcRenderer.send(channels.APP_CLOSE);
};

export default {
  close,
  init,
  restart,
};
