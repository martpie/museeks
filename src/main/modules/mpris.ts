/**
 * Module in charge of setting and manage mpris service for linux
 */

import electron from 'electron';
import mpris from 'mpris-service';
import * as mime from 'mime-types';

import { TrackModel } from '../../shared/types/museeks';
import { fetchCover } from '../../shared/lib/utils-cover';
import { SUPPORTED_TRACKS_EXTENSIONS } from '../../shared/constants';
import channels from '../../shared/lib/ipc-channels';
import ModuleWindow from './module-window';

const { app, ipcMain } = electron;

class MprisModule extends ModuleWindow {
  protected player: null | any;

  constructor(window: Electron.BrowserWindow) {
    super(window);

    // Temporarily disabled everywhere, was we use window.mediaSession to control
    // the player on all platforms.
    this.platforms = [];
    // this.platforms = ['linux'];
  }

  async load(): Promise<void> {
    this.player = mpris({
      name: 'museeks',
      identity: 'Museeks',
      desktopEntry: 'museeks',
      canRaise: true,
      supportedUriSchemes: ['file', 'data'],
      supportedMimeTypes: SUPPORTED_TRACKS_EXTENSIONS.map(mime.lookup).filter(Boolean),
      supportedInterfaces: ['player'],
    });

    this.player.canEditTracks = false;
    this.player.playbackStatus = 'Stopped';

    // Manage playbackStatus for the current song
    ipcMain.on(channels.PLAYBACK_PLAY, () => {
      this.player.playbackStatus = 'Playing';
    });

    ipcMain.on(channels.PLAYBACK_PAUSE, () => {
      this.player.playbackStatus = 'Paused';
    });

    ipcMain.on(channels.PLAYBACK_TRACK_CHANGE, async (_e: Event, track: TrackModel) => {
      await this.updateCurrentTrack(track);
    });

    ipcMain.on(channels.PLAYBACK_PLAY, () => {
      this.player.playbackStatus = 'Playing';
    });

    ipcMain.on(channels.PLAYBACK_PAUSE, () => {
      this.player.playbackStatus = 'Paused';
    });

    // Manage player actions with mpris
    this.player.on('raise', () => {
      this.window.show();
    });

    this.player.on('quit', () => {
      app.exit();
    });

    this.player.on('playpause', () => {
      this.window.webContents.send(channels.PLAYBACK_PLAYPAUSE);
    });

    this.player.on('play', () => {
      this.window.webContents.send(channels.PLAYBACK_PLAY);
      this.player.playbackStatus = 'Playing';
    });

    this.player.on('pause', () => {
      this.window.webContents.send(channels.PLAYBACK_PAUSE);
      this.player.playbackStatus = 'Paused';
    });

    this.player.on('next', () => {
      this.window.webContents.send(channels.PLAYBACK_NEXT);
    });

    this.player.on('previous', () => {
      this.window.webContents.send(channels.PLAYBACK_PREVIOUS);
    });

    this.player.on('stop', () => {
      this.window.webContents.send(channels.PLAYBACK_STOP);
      this.player.playbackStatus = 'Stopped';
    });
  }

  async updateCurrentTrack(track: TrackModel) {
    const cover = await fetchCover(track.path, true);

    // this.player.canSeek = true;
    this.player.canPlay = true;
    this.player.canPause = true;
    this.player.canGoPrevious = true;
    this.player.canGoNext = true;
    this.player.metadata = {
      'mpris:length': Math.ceil(track.duration * 1000000), // should be in microseconds
      'mpris:artUrl': `file://${cover}`,
      'xesam:title': track.title,
      'xesam:album': track.album,
      'xesam:artist': track.artist,
    };
  }
}

export default MprisModule;
