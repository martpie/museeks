/**
 * Module in charge of the app menu
 * Litteraly stolen from: https://electronjs.org/docs/api/menu#examples
 */

import { Menu, shell } from 'electron';

import channels from '../../shared/lib/ipc-channels';

import ModuleWindow from './module-window';

class ApplicationMenuModule extends ModuleWindow {
  async load(): Promise<void> {
    const template: Electron.MenuItemConstructorOptions[] = [
      { role: 'appMenu' },
      { role: 'fileMenu' },
      { role: 'editMenu' },
      {
        label: 'View',
        submenu: [
          {
            label: 'Jump to playing track',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              this.window.webContents.send(channels.MENU_JUMP_TO_PLAYING_TRACK);
            },
          },
          { type: 'separator' },
          {
            label: 'Go to library',
            accelerator: 'CmdOrCtrl+L',
            click: () => {
              this.window.webContents.send(channels.MENU_GO_TO_LIBRARY);
            },
          },
          {
            label: 'Go to playlists',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
              this.window.webContents.send(channels.MENU_GO_TO_PLAYLISTS);
            },
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      { role: 'windowMenu' },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              await shell.openExternal('https://museeks.io');
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

export default ApplicationMenuModule;
