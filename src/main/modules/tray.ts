/**
 * Module in charge of the Tray
 */

import os from 'os';
import path from 'path';

import ps from 'ps-node';
import { Tray, Menu, app, ipcMain, nativeImage } from 'electron';

import { TrackModel, PlayerStatus } from '../../shared/types/museeks';
import channels from '../../shared/lib/ipc-channels';
import logger from '../../shared/lib/logger';

import ModuleWindow from './module-window';

export default class TrayModule extends ModuleWindow {
  protected tray: Electron.Tray | null;
  protected trayIcon: Electron.NativeImage;
  protected playToggle: Electron.MenuItemConstructorOptions[];
  protected pauseToggle: Electron.MenuItemConstructorOptions[];
  protected songDetails: Electron.MenuItemConstructorOptions[];
  protected menu: Electron.MenuItemConstructorOptions[];
  protected status: PlayerStatus;

  constructor(window: Electron.BrowserWindow) {
    super(window);

    this.platforms = ['linux', 'win32'];

    this.tray = null;
    this.playToggle = [];
    this.pauseToggle = [];
    this.songDetails = [];
    this.menu = [];
    this.status = PlayerStatus.PAUSE;

    // I don't like it, but will do for now
    const logosPath = path.resolve(path.join(__dirname, '../shared/logos'));

    const trayIcons = {
      tray: nativeImage
        .createFromPath(path.join(logosPath, 'museeks-tray.png'))
        .resize({ width: 24, height: 24 }),
      'tray-win32': nativeImage.createFromPath(
        path.join(logosPath, 'museeks-tray.ico'),
      ),
      'tray-darwin-dark': nativeImage.createFromPath(
        path.join(logosPath, 'museeks-tray-dark.png'),
      ),
    };

    // Make it "lightable" on macOS
    trayIcons['tray-darwin-dark'].setTemplateImage(true);

    // Pick the right icon for the right platform
    this.trayIcon = trayIcons.tray;

    if (os.platform() === 'win32') this.trayIcon = trayIcons['tray-win32'];
    else if (os.platform() === 'darwin')
      this.trayIcon = trayIcons['tray-darwin-dark'];
  }

  async load(): Promise<void> {
    // Fix for gnome-shell and high-dpi
    // TODO: should we still use that?
    if (os.platform() === 'linux') {
      ps.lookup(
        {
          command: 'gnome-shell',
        },
        (err: Error) => {
          if (err) {
            logger.warn(err);
          } else {
            this.trayIcon = nativeImage.createFromPath(
              path.join(
                path.resolve(path.join(__dirname, '../shared/logos')),
                'museeks-tray.png',
              ),
            );

            this.refreshTrayIcon();
          }
        },
      );
    }

    this.tray = null;

    this.songDetails = [
      {
        label: 'Not playing',
        enabled: false,
      },
      {
        type: 'separator',
      },
    ];

    this.playToggle = [
      {
        label: 'Play',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_PLAY);
        },
      },
    ];

    this.pauseToggle = [
      {
        label: 'Pause',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_PAUSE);
        },
      },
    ];

    this.menu = [
      {
        label: 'Previous',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_PREVIOUS);
        },
      },
      {
        label: 'Next',
        click: () => {
          this.window.webContents.send(channels.PLAYBACK_NEXT);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Show',
        click: () => {
          this.window.show();
          this.window.focus();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
          this.window.destroy();
        },
      },
    ];

    // Load events listener for player actions
    ipcMain.on(channels.PLAYBACK_PLAY, () => {
      this.status = PlayerStatus.PLAY;
      this.setContextMenu(PlayerStatus.PLAY);
    });

    ipcMain.on(channels.PLAYBACK_PAUSE, () => {
      this.status = PlayerStatus.PAUSE;
      this.setContextMenu(PlayerStatus.PAUSE);
    });

    ipcMain.on(
      channels.PLAYBACK_TRACK_CHANGE,
      (_e: Event, track: TrackModel) => {
        this.status = PlayerStatus.PLAY;
        this.updateTrayMetadata(track);
        this.setContextMenu(PlayerStatus.PLAY);
      },
    );
  }

  create(): void {
    this.tray = new Tray(this.trayIcon);
    this.tray.setToolTip('Museeks');

    if (os.platform() === 'win32') {
      this.tray.on('click', () => {
        this.window.show();
        this.window.focus();
      });
    } else if (os.platform() === 'darwin') {
      this.tray.on('double-click', () => {
        this.window.show();
        this.window.focus();
      });
    }

    this.setContextMenu(this.status);
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
    }
  }

  setContextMenu(state: PlayerStatus): void {
    const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
    const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];

    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
    }
  }

  refreshTrayIcon(): void {
    if (this.tray) {
      this.tray.setImage(this.trayIcon);
    }
  }

  updateTrayMetadata(track: TrackModel): void {
    this.songDetails = [
      {
        label: `${track.title}`,
        enabled: false,
      },
      {
        label: `by ${track.artist}`,
        enabled: false,
      },
      {
        label: `on ${track.album}`,
        enabled: false,
      },
      {
        type: 'separator',
      },
    ];
  }
}
