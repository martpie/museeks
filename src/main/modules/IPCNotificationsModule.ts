import type Store from 'electron-store';
import { ipcMain, NativeImage, nativeImage, Notification } from 'electron';

import channels from '../../shared/lib/ipc-channels';
import { Config, TrackModel } from '../../shared/types/museeks';
import * as utilsCover from '../lib/utils-cover';

import ModuleWindow from './BaseWindowModule';

/**
 * Module in charge of displaying native notifications on certain user actions
 */
export default class IPCNotificationsModule extends ModuleWindow {
  protected config: Store<Config>;

  constructor(window: Electron.BrowserWindow, config: Store<Config>) {
    super(window);
    this.config = config;
  }

  async load(): Promise<void> {
    ipcMain.on(channels.PLAYBACK_PLAY, (_e: Event, track: TrackModel) => {
      this.sendPlaybackNotification(track);
    });
  }

  private async sendPlaybackNotification(track: TrackModel): Promise<void> {
    if (
      this.window.isFocused() ||
      this.config.get('displayNotifications') === false
    ) {
      return;
    }

    const cover = await utilsCover.fetchCover(track.path);

    let icon: NativeImage | undefined = undefined;

    if (cover !== null) {
      icon = nativeImage.createFromDataURL(cover);
    }

    const notification = new Notification({
      title: track.title,
      body: `${track.artist}\n${track.album}`,
      icon,
      silent: true,
    });

    notification.on('click', () => {
      this.window.show();
      this.window.focus();
    });

    notification.show();
  }
}
