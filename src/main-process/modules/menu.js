/**
 * Module in charge of the app menu
 * Litteraly stolen from: https://electronjs.org/docs/api/menu#examples
 */

const { app, Menu, shell } = require('electron');

const Module = require('./module');


class PowerMonitor extends Module {
  constructor(window) {
    super(window);
  }

  load() {
    if (process.platform === 'darwin') {
      const template = [
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
            { role: 'selectall' },
          ],
        },
        {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
          ],
        },
        {
          role: 'window',
          submenu: [
            { role: 'minimize' },
            { role: 'close' },
          ],
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click () {
                shell.openExternal('https://github.com/KeitIG/museeks');
              },
            },
          ],
        },
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
            { role: 'quit' },
          ],
        });

        // Edit menu
        template[1].submenu.push(
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' },
            ],
          }
        );

        // Window menu
        template[3].submenu = [
          { role: 'close' },
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' },
        ];
      }

      const osxMenu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(osxMenu);
    }
  }
}

module.exports = PowerMonitor;
