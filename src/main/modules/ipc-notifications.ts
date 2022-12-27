import { ipcMain, NativeImage, nativeImage, Notification } from 'electron';
import TeenyConf from 'teeny-conf';

import * as utilsCover from '../lib/utils-cover';

import ModuleWindow from './module-window';

import channels from '~shared/lib/ipc-channels';
import { Config, TrackModel } from '~shared/types/museeks';

/**
 * Module in charge of displaying native notifications on certain user actions
 */
class IPCNotificationsModule extends ModuleWindow {
  protected config: TeenyConf<Config>;

  constructor(window: Electron.BrowserWindow, config: TeenyConf<Config>) {
    super(window);
    this.config = config;
  }

  async load(): Promise<void> {
    ipcMain.on(channels.PLAYBACK_PLAY, (_e: Event, track: TrackModel) => {
      this.sendPlaybackNotification(track);
    });
  }

  private async sendPlaybackNotification(track: TrackModel): Promise<void> {
    if (this.window.isFocused() || this.config.getx('displayNotifications') === false) {
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

export default IPCNotificationsModule;
