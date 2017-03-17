'use strict';

import os from 'os';

import { Tray, Menu, app, ipcMain } from 'electron';
import lib from './lib';

class IpcManager {

    constructor(win, icon, store) {
        const { dispatch } = store;

        this.tray = null;
        this.trayIcon = icon;
        this.win = win;
        this.contextMenu;

        this.songDetails = [
            {
                label: 'Not playing',
                enabled: false
            },
            {
                type: 'separator'
            }
        ];

        this.playToggle = [
            {
                label: 'Play',
                click: () => {
                    dispatch(lib.actions.player.play.play());
                }
            }
        ];

        this.pauseToggle = [
            {
                label: 'Pause',
                click: () => {
                    dispatch(lib.actions.player.play.pause());
                }
            }
        ];

        this.menu = [
            {
                label: 'Previous',
                click: () => {
                    dispatch(lib.actions.player.play.prev());
                }
            },
            {
                label: 'Next',
                click: () => {
                    dispatch(lib.actions.player.play.next());
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

        ipcMain.on('playerAction', (event, reply, data) => {
            switch(reply) {
                case 'play': {
                    this.setContextMenu('play');
                    break;
                }

                case 'pause': {
                    this.setContextMenu('pause');
                    break;
                }
                case 'trackStart': {
                    this.updateTrayMetadata(data);
                    this.setContextMenu('play');
                    break;
                }
            }
        });
    }

    show() {
        this.tray = new Tray(this.trayIcon);

        this.tray.setToolTip('Museeks');

        if (os.platform() === 'win32') {
            this.tray.on('click', () => {
                this.win.show();
                this.win.focus();
                this.hide();
            });
        } else if (os.platform() === 'darwin') {
            this.tray.on('double-click', () => {
                this.win.show();
                this.win.focus();
                this.hide();
            });
        }

        this.setContextMenu('play');
    }

    hide() {
        this.tray.destroy();
    }

    setContextMenu(state) {
        const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
        const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];
        this.tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
    }


    updateTrayMetadata(metadata) {
        this.songDetails = [
            {
                label: `${metadata.title}`,
                enabled: false
            },
            {
                label: `by ${metadata.artist}`,
                enabled: false
            },
            {
                label: `on ${metadata.album}`,
                enabled: false
            },
            {
                type: 'separator'
            }
        ];
    }
}

export default IpcManager;
