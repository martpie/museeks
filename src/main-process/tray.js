'use strict';

const os = require('os');

const { Tray, Menu, ipcMain } = require('electron');

class IpcManager {

    constructor(win, icon) {

        this.tray = null;
        this.trayIcon = icon;
        this.win = win;
    }

    bindEvents() {

        ipcMain.on('showTray', () => {

            this.show();
        });

        ipcMain.on('hideTray', () => {

            this.hide();
        });
    }

    show() {

        this.tray = new Tray(this.trayIcon);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                click: () => {
                    this.win.show();
                    this.hide();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: () => {
                    this.win.destroy();
                }
            }
        ]);

        this.tray.setToolTip('Museeks');
        this.tray.setTitle('Museeks');

        if(os.platform() === 'win32') {
            this.tray.on('click', () => {
                this.win.show();
                this.hide();
            });
        }
        else { // Darwin or Linux
            this.tray.on('double-click', () => {
                this.win.show();
                this.hide();
            });
        }

        this.tray.setContextMenu(contextMenu);
    }

    hide() {

        this.tray.destroy();
    }
}

module.exports = IpcManager;
