'use strict';


class PowerMonitor {

    constructor(win) {
        this.win = win;
    }

    enable() {
        const { powerMonitor } = require('electron');
        const win = this.win;

        powerMonitor.on('suspend', () => {
            win.webContents.send('playerAction', 'pause');
        });
    }
}

module.exports = PowerMonitor;
