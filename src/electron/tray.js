import os from 'os';

import { Tray, Menu, app, ipcMain } from 'electron';
import lib from './lib';

class TrayManager {

    constructor(win, icon, lib) {
        const { dispatch } = lib.store;

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
                    dispatch(lib.actions.player.play());
                }
            }
        ];

        this.pauseToggle = [
            {
                label: 'Pause',
                click: () => {
                    dispatch(lib.actions.player.pause());
                }
            }
        ];

        const itemPrevious = {
            label: 'Previous',
            click: () => {
                dispatch(lib.actions.player.prev());
            }
        };

        const itemNext = {
            label: 'Next',
            click: () => {
                dispatch(lib.actions.player.next());
            }
        };

        const itemSeparator = {
            type: 'separator'
        };

        const itemShow = {
            label: 'Show',
            click: () => {
                this.win.show();
                this.win.focus();
            }
        };

        const itemQuit = {
            label: 'Quit',
            click: () => {
                this.win.destroy();
                app.quit();
            }
        };

        this.menu = [
            itemPrevious,
            itemNext,
            itemSeparator,
            itemShow,
            itemSeparator,
            itemQuit,
        ];
    }

    show = () => {
        this.tray = new Tray(this.trayIcon);

        this.tray.setToolTip('Museeks');

        if (os.platform() === 'win32') {
            this.tray.on('click', () => {
                this.win.show();
                this.win.focus();
            });
        } else if (os.platform() === 'darwin') {
            this.tray.on('double-click', () => {
                this.win.show();
                this.win.focus();
            });
        }

        this.setContextMenu('play');
    }

    hide = () => {
        this.tray.destroy();
    }

    setContextMenu = (state) => {
        const playPauseItem = state === 'play' ? this.pauseToggle : this.playToggle;
        const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];
        this.tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
    }

    updateTrayMetadata = (metadata) => {
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

export default TrayManager;
