'use strict';

const os = require('os');

const { Tray, Menu, app, ipcMain } = require('electron');

class IpcManager {

    constructor(win, icon) {

        this.tray = null;
        this.trayIcon = icon;
        this.win = win;
        this.contextMenu;


        this.playToggle = [
            {
                label: 'Play',
                click: () => {
                    this.win.webContents.send('playerAction', 'play');
                }
            }
        ];

        this.pauseToggle = [
            {
                label: 'Pause',
                click: () => {
                    this.win.webContents.send('playerAction', 'pause');
                }
            }
        ];

        this.menu = [
            {
                label: 'Previous',
                click: () => {
                    this.win.webContents.send('playerAction', 'prev');
                }
            },
            {
                label: 'Next',
                click: () => {
                    this.win.webContents.send('playerAction', 'next');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Show',
                click: () => {
                    this.win.show();
                    this.win.focus();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: () => {
                    this.win.destroy();
                    app.quit();
                }
            }
        ];
    }

    bindEvents() {

        ipcMain.on('showTray', () => {

            this.show();
        });

        ipcMain.on('hideTray', () => {

            this.hide();
        });

        ipcMain.on('playerAction', (event, reply) => {

            switch(reply) {
                case 'play':
                    this.tray.setContextMenu(Menu.buildFromTemplate([...this.pauseToggle, ...this.menu]));
                    break;
                case 'pause':
                    this.tray.setContextMenu(Menu.buildFromTemplate([...this.playToggle, ...this.menu]));
                    break;
            }
        });
    }

    show() {

        this.tray = new Tray(this.trayIcon);

        this.tray.setToolTip('Museeks');
        this.tray.setTitle('Museeks');

        if(os.platform() === 'win32') {
            this.tray.on('click', () => {
                this.win.show();
                this.win.focus();
                this.hide();
            });
        } else if(os.platform() === 'darwin') {
            this.tray.on('double-click', () => {
                this.win.show();
                this.win.focus();
                this.hide();
            });
        }

        this.tray.setContextMenu(Menu.buildFromTemplate([...this.playToggle, ...this.menu]));
    }

    hide() {

        this.tray.destroy();
    }
}

module.exports = IpcManager;
