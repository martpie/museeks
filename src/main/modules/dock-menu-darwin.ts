/**
 * Module in charge of the dock menu on macOS
 */

import { Menu, app, ipcMain } from 'electron';

import ModuleWindow from './module-window';
import { PlayerStatus, TrackModel } from '../../shared/types/interfaces';

class DockMenuDarwinModule extends ModuleWindow {
  protected menu: Electron.MenuItemConstructorOptions[];
  protected songDetails: Electron.MenuItemConstructorOptions[];
  protected playToggle: Electron.MenuItemConstructorOptions[];
  protected pauseToggle: Electron.MenuItemConstructorOptions[];

  constructor (window: Electron.BrowserWindow) {
    super(window);
    this.platforms = ['darwin'];

    this.menu = [];
    this.songDetails = [];
    this.playToggle = [];
    this.pauseToggle = [];
  }

  async load () {
    this.songDetails = [
      {
        label: 'Not playing',
        enabled: false
      },
      {
        type: 'separator'
      }
    ];

    this.playToggle = [
      {
        label: 'Play',
        click: () => {
          this.window.webContents.send('playback:play');
        }
      }
    ];

    this.pauseToggle = [
      {
        label: 'Pause',
        click: () => {
          this.window.webContents.send('playback:pause');
        }
      }
    ];

    this.menu = [
      {
        label: 'Previous',
        click: () => {
          this.window.webContents.send('playback:previous');
        }
      },
      {
        label: 'Next',
        click: () => {
          this.window.webContents.send('playback:next');
        }
      }
    ];

    // Load events listener for player actions
    ipcMain.on('playback:play', () => {
      this.setDockMenu(PlayerStatus.PLAY);
    });

    ipcMain.on('playback:pause', () => {
      this.setDockMenu(PlayerStatus.PAUSE);
    });

    ipcMain.on('playback:trackChange', (_e: Event, track: TrackModel) => {
      this.updateTrayMetadata(track);
      this.setDockMenu(PlayerStatus.PLAY);
    });

    this.setDockMenu(PlayerStatus.PAUSE);
  }

  setDockMenu (state: PlayerStatus) {
    const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
    const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];
    app.dock.setMenu(Menu.buildFromTemplate(menuTemplate));
  }

  updateTrayMetadata (metadata: TrackModel) {
    this.songDetails = [
      {
        label: `${metadata.title}`,
        enabled: false
      },
      {
        label: `by ${metadata.artist}`,
        enabled: false
      },
      {
        label: `on ${metadata.album}`,
        enabled: false
      },
      {
        type: 'separator'
      }
    ];
  }
}

export default DockMenuDarwinModule;
