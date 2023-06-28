/**
 * Essential module for creating/loading the app config
 */

import electron, { app, ipcMain } from 'electron';
import Store from 'electron-store';

import { Config, Repeat, SortBy, SortOrder } from '../../shared/types/museeks';
import channels from '../../shared/lib/ipc-channels';
import logger from '../../shared/lib/logger';

import Module from './BaseModule';

export default class ConfigModule extends Module {
  private workArea: Electron.Rectangle;
  private config: Store<Config>;

  constructor() {
    super();

    logger.info(`Using "${app.getPath('userData')}" as config path`);

    this.workArea = electron.screen.getPrimaryDisplay().workArea;
    this.config = new Store<Config>({
      name: 'config',
      defaults: this.getDefaultConfig(),
    });
  }

  async load(): Promise<void> {
    ipcMain.on(channels.CONFIG_GET_ALL, (event) => {
      event.returnValue = this.config.store;
    });

    ipcMain.handle(channels.CONFIG_GET_ALL, (): Config => this.config.store);

    ipcMain.handle(
      channels.CONFIG_GET,
      <T extends keyof Config>(_e: Electron.Event, key: T): Config[T] => {
        logger.debug('Config get', key);
        return this.config.get(key);
      },
    );

    ipcMain.handle(
      channels.CONFIG_SET,
      <T extends keyof Config>(
        _e: Electron.Event,
        key: T,
        value: Config[T],
      ): void => {
        logger.debug('Config set', key, value);
        this.config.set(key, value);
      },
    );
  }

  getConfig(): Store<Config> {
    const config = this.config;

    if (config === undefined) {
      throw new Error('Config is not defined, has it been loaded?');
    }

    return config;
  }

  getDefaultConfig(): Config {
    const config: Config = {
      theme: '__system',
      audioVolume: 1,
      audioPlaybackRate: 1,
      audioOutputDevice: 'default',
      audioMuted: false,
      audioShuffle: false,
      audioRepeat: Repeat.NONE,
      defaultView: 'library',
      librarySort: {
        by: SortBy.ARTIST,
        order: SortOrder.ASC,
      },
      // musicFolders: [],
      sleepBlocker: false,
      autoUpdateChecker: true,
      displayNotifications: true,
      bounds: {
        width: 1000,
        height: 600,
        x: Math.round(this.workArea.width / 2),
        y: Math.round(this.workArea.height / 2),
      },
    };

    return config;
  }
}
