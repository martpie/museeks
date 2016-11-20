'use strict';

const { Tray, Menu, app } = require('electron');

class IpcManager {

    constructor(win, icon) {

        this.tray = null;
        this.trayIcon = icon;
        this.win = win;
    }

    show() {

        this.tray = new Tray(this.trayIcon);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                click: () => {
                    this.win.show();
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
        ]);

        this.tray.setToolTip('Museeks');
        this.tray.setContextMenu(contextMenu);
    }

    hide() {

        this.tray.destroy();
    }
}

module.exports = IpcManager;
