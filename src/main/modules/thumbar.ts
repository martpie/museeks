/**
 * Module in charge of the Windows Thumbar
 * (buttons appearing on Museeks preview when hovering the icon)
 *
 * Windows only
 */

import * as path from 'path';
import { nativeImage, ipcMain } from 'electron';

import ModuleWindow from './module-window';

const { createFromPath } = nativeImage;

const iconsDirectory = path.resolve(path.join(__dirname, '../../src/images/icons/windows'));

class ThumbarModule extends ModuleWindow {
  constructor (window: Electron.BrowserWindow) {
    super(window);
    this.platforms = ['win32'];
  }

  async load () {
    const { window } = this;

    const icons = {
      play: createFromPath(path.join(iconsDirectory, 'play.ico')),
      // playDisabled: createFromPath(path.join(iconsDirectory, 'play-disabled.ico')),
      pause: createFromPath(path.join(iconsDirectory, 'pause.ico')),
      pauseDisabled: createFromPath(path.join(iconsDirectory, 'pause-disabled.ico')),
      prev: createFromPath(path.join(iconsDirectory, 'backward.ico')),
      prevDisabled: createFromPath(path.join(iconsDirectory, 'backward-disabled.ico')),
      next: createFromPath(path.join(iconsDirectory, 'forward.ico')),
      nextDisabled: createFromPath(path.join(iconsDirectory, 'forward-disabled.ico'))
    };

    const thumbarButtons = {
      play: {
        tooltip: 'Play',
        icon: icons.play,
        click: () => {
          window.webContents.send('playback:play');
        }
      },
      /* playDisabled: {
        tooltip: 'Play',
        flags: ['disabled'],
        icon: icons.playDisabled,
        click: () => { return null; } // Electron's TypeScript definition issue
      }, */
      pause: {
        tooltip: 'Pause',
        icon: icons.pause,
        click: () => {
          window.webContents.send('playback:pause');
        }
      },
      pauseDisabled: {
        tooltip: 'Pause',
        flags: ['disabled'],
        icon: icons.pauseDisabled,
        click: () => { return null; } // Electron's TypeScript definition issue
      },
      prev: {
        tooltip: 'Prev',
        icon: icons.prev,
        click: () => {
          window.webContents.send('playback:previous');
        }
      },
      prevDisabled: {
        tooltip: 'Prev',
        flags: ['disabled'],
        icon: icons.prevDisabled,
        click: () => { return null; } // Electron's TypeScript definition issue
      },
      next: {
        tooltip: 'Next',
        icon: icons.next,
        click: () => {
          window.webContents.send('playback:next');
        }
      },
      nextDisabled: {
        tooltip: 'Next',
        flags: ['disabled'],
        icon: icons.nextDisabled,
        click: () => { return null; } // Electron's TypeScript definition issue
      }
    };

    ipcMain.on('app:ready', () => {
      window.setThumbarButtons([
        thumbarButtons.prevDisabled,
        thumbarButtons.play,
        thumbarButtons.nextDisabled
      ]);
    });

    ipcMain.on('playback:play', () => {
      window.setThumbarButtons([
        thumbarButtons.prev,
        thumbarButtons.pause,
        thumbarButtons.next
      ]);
    });

    ipcMain.on('playback:pause', () => {
      window.setThumbarButtons([
        thumbarButtons.prev,
        thumbarButtons.play,
        thumbarButtons.next
      ]);
    });

    ipcMain.on('playback:stop', () => {
      window.setThumbarButtons([
        thumbarButtons.prevDisabled,
        thumbarButtons.play,
        thumbarButtons.nextDisabled
      ]);
    });
  }
}

export default ThumbarModule;
