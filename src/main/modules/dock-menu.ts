/**
 * Module in charge of the dock menu on macOS
 */

import { Menu, app, ipcMain } from 'electron';

import ModuleWindow from './module-window';
import { PlayerStatus } from '../../shared/types/interfaces';

class DockMenuModule extends ModuleWindow {
  protected menu: Electron.MenuItemConstructorOptions[];
  protected playToggle: Electron.MenuItemConstructorOptions[];
  protected pauseToggle: Electron.MenuItemConstructorOptions[];

  constructor (window: Electron.BrowserWindow) {
    super(window);
    this.platforms = ['linux'];

    this.menu = [];
    this.playToggle = [];
    this.pauseToggle = [];
  }

  async load () {
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
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
          this.window.destroy();
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

    this.setDockMenu(PlayerStatus.PAUSE);
  }

  setDockMenu (state: PlayerStatus) {
    const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
    const menuTemplate = [...playPauseItem, ...this.menu];
    app.dock.setMenu(Menu.buildFromTemplate(menuTemplate));
  }
}

export default DockMenuModule;
