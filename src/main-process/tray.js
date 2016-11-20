'use strict';

const path = require('path');
const { Tray, Menu, ipcMain, app, nativeImage } = require('electron');

const iconsDirectory = path.resolve(__dirname, '../', 'images', 'icons', 'tray');

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
                label: 'Play',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play.png')),
                click: () => {
                    this.win.webContents.send('playerAction', 'play');
                }
            },
            {
                label: 'Pause',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause.png')),
                click: () => {
                    this.win.webContents.send('playerAction', 'pause');
                }
            },
            {
                label: 'Prev',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'backward.png')),
                click: () => {
                    this.win.webContents.send('playerAction', 'prev');
                }
            },
            {
                label: 'Next',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'forward.png')),
                click: () => {
                    this.win.webContents.send('playerAction', 'next');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Show',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'window-restore.png')),
                click: () => {
                    this.win.show();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'times.png')),
                click: () => {
                    this.win.destroy();
                    app.quit();
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
