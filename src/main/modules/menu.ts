/**
 * Module in charge of the app menu
 * Litteraly stolen from: https://electronjs.org/docs/api/menu#examples
 */

import { app, Menu, shell } from 'electron';

import ModuleWindow from './module-window';

class MenuModule extends ModuleWindow {
  async load () {
    if (process.platform === 'darwin') {
      const template: Electron.MenuItemConstructorOptions[] = [
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
          ]
        },
        {
          label: 'View',
          submenu: [
            { role: 'togglefullscreen' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' }
          ]
        },
        {
          role: 'window',
          submenu: [
            { role: 'minimize' },
            { role: 'close' }
          ]
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click () {
                shell.openExternal('https://github.com/martpie/museeks');
              }
            }
          ]
        }
      ];

      if (process.platform === 'darwin') {
        template.unshift({
          label: app.getName(),
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        });

        // Edit menu
        // template[1].submenu.push(
        //   { type: 'separator' },
        //   {
        //     label: 'Speech',
        //     submenu: [
        //       { role: 'startspeaking' },
        //       { role: 'stopspeaking' }
        //     ]
        //   }
        // );

        // Window menu
        template[3].submenu = [
          { role: 'close' },
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' }
        ];
      }

      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    }
  }
}

export default MenuModule;
