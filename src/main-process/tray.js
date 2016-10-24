'use strict';

const { Tray, Menu, ipcMain } = require('electron');

class IpcManager {

    constructor(win, icon) {

        this.tray = null;
        this.trayIcon = icon;
        this.win = win;
    }

    bindEvents() {

        const self = this;

        ipcMain.on('showTray', () => {

            self.show();
        });

        ipcMain.on('hideTray', () => {

            self.hide();
        });
    }

    show() {

        const self = this;

        this.tray = new Tray(this.trayIcon);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                click: () => {
                    self.win.show();
                    self.hide();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: () => {
                    self.win.destroy();
                }
            }
        ]);

        this.tray.setToolTip('Museeks');
        this.tray.setContextMenu(contextMenu);
    }

    hide() {

        this.tray.destroy();
    }
}

module.exports = IpcManager;
