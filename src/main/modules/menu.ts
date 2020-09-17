/**
 * Module in charge of the app menu
 * Litteraly stolen from: https://electronjs.org/docs/api/menu#examples
 */

import { Menu, shell } from 'electron';

import ModuleWindow from './module-window';

class MenuModule extends ModuleWindow {
  async load() {
    const template: Electron.MenuItemConstructorOptions[] = [
      { role: 'appMenu' },
      { role: 'fileMenu' },
      { role: 'editMenu' },
      { role: 'viewMenu' },
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

export default MenuModule;
