'use strict';

const lib = require('./lib');

class PowerMonitor {

    constructor(win, store) {
        this.win = win;
        this.store = store;
    }

    enable() {
        const { powerMonitor } = require('electron');
        const win = this.win;

        powerMonitor.on('suspend', () => {
            this.store.dispatch(lib.actions.player.pause());
        });
    }
}

module.exports = PowerMonitor;
