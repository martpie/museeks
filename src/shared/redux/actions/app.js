const utils = require('../../utils/utils');
const { ipcRenderer } = require('electron');
// const { globalShortcut } = require('electron').remote;

const library = (lib) => {

    const init = () => {
        console.log('xxx', lib)
        lib.actions.library.load();
        lib.actions.playlist.refresh();
        lib.actions.settings.check();
        initShortcuts();
        start();

        // Listen for main-process events
        ipcRenderer.on('playerAction', (event, reply) => {
            switch(reply) {
                case 'play':
                    lib.actions.player.play();
                    break;
                case 'pause':
                    lib.actions.player.pause();
                    break;
                case 'prev':
                    lib.actions.player.previous();
                    break;
                case 'next':
                    lib.actions.player.next();
                    break;
            }
        });

        // Listen for main-process events
        ipcRenderer.on('close', () => {
            close();
        });

        // Prevent some events
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
        }, false);

        window.addEventListener('drop', (e) => {
            e.preventDefault();
        }, false);

        // Remember dimensions and positionning
        const currentWindow = lib.app.browserWindows.main;

        currentWindow.on('resize', saveBounds);

        currentWindow.on('move', saveBounds);
    };

    const start = () => {
        ipcRenderer.send('appReady');
    };

    const restart = () => {
        ipcRenderer.send('appRestart');
    };

    const close = () => (dispatch, getState) => {
        if (getState().config.minimizeToTray) {
            lib.app.browserWindows.main.hide();
        } else {
            lib.app.browserWindows.main.destroy();
        }
    };

    const minimize = () => {
        lib.app.browserWindows.main.minimize();
    };

    const maximize = () => {
        lib.app.browserWindows.main.isMaximized()
            ? lib.app.browserWindows.main.unmaximize()
            : lib.app.browserWindows.main.maximize();
    };

    const saveBounds = () => {
        const now = window.performance.now();

        if (now - self.lastFilterSearch < 250) {
            clearTimeout(self.filterSearchTimeOut);
        }

        self.lastFilterSearch = now;

        self.filterSearchTimeOut = setTimeout(() => {
            lib.config.set('bounds', lib.app.browserWindows.main.getBounds());
            lib.config.saveSync();
        }, 250);
    };

    const initShortcuts = () => {
        // // Global shortcuts - Player
        // globalShortcut.register('MediaPlayPause', () => {
        //     lib.actions.player.playToggle();
        // });
        //
        // globalShortcut.register('MediaPreviousTrack', () => {
        //     lib.actions.player.previous();
        // });
        //
        // globalShortcut.register('MediaNextTrack', () => {
        //     lib.actions.player.next();
        // });
    };

    return {
        close,
        init,
        initShortcuts,
        maximize,
        minimize,
        saveBounds,
        start,
        restart
    }
}

module.exports = library;
