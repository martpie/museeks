import Player from '../lib/player';
import app    from '../lib/app';

import LibraryActions       from './LibraryActions';
import PlaylistsActions     from './PlaylistsActions';
import NotificationsActions from './NotificationsActions';
import PlayerActions        from './PlayerActions';
import QueueActions         from './QueueActions';
import SettingsActions      from './SettingsActions';

const globalShortcut = electron.remote.globalShortcut;
const ipcRenderer    = electron.ipcRenderer;


const AppActions = {

    player        : PlayerActions,
    playlists     : PlaylistsActions,
    queue         : QueueActions,
    library       : LibraryActions,
    settings      : SettingsActions,
    notifications : NotificationsActions,

    init: function() {

        // Usual tasks
        this.library.load();
        this.playlists.refresh();
        this.settings.check();
        this.app.initShortcuts();
        this.app.start();

        // Bind player events
        // Audio Events
        Player.getAudio().addEventListener('ended', AppActions.player.next);
        Player.getAudio().addEventListener('error', AppActions.player.audioError);
        Player.getAudio().addEventListener('timeupdate', () => {
            if (Player.isThresholdReached()) {
                LibraryActions.incrementPlayCount(Player.getAudio().src);
            }
        });
        Player.getAudio().addEventListener('play', () => {
            ipcRenderer.send('playerAction', 'play');
        });
        Player.getAudio().addEventListener('pause', () => {
            ipcRenderer.send('playerAction', 'pause');
        });

        // Listen for main-process events
        ipcRenderer.on('playerAction', (event, reply) => {

            switch(reply) {
                case 'play':
                    AppActions.player.play();
                    break;
                case 'pause':
                    AppActions.player.pause();
                    break;
                case 'prev':
                    AppActions.player.previous();
                    break;
                case 'next':
                    AppActions.player.next();
                    break;
            }
        });

        // Prevent some events
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
        }, false);

        window.addEventListener('drop', (e) => {
            e.preventDefault();
        }, false);

        // Remember dimensions and positionning
        const currentWindow = app.browserWindows.main;

        currentWindow.on('resize', () => {
            AppActions.app.saveBounds();
        });

        currentWindow.on('move', () => {
            AppActions.app.saveBounds();
        });
    },

    app: {

        start: function() {
            ipcRenderer.send('appReady');
        },

        restart: function() {
            ipcRenderer.send('appRestart');
        },

        close: function() {
            app.browserWindows.main.close();
        },

        minimize: function() {
            app.browserWindows.main.minimize();
        },

        maximize: function() {
            app.browserWindows.main.isMaximized() ? app.browserWindows.main.unmaximize() : app.browserWindows.main.maximize();
        },

        saveBounds: function() {

            const self = AppActions;
            const now = window.performance.now();

            if (now - self.lastFilterSearch < 250) {
                clearTimeout(self.filterSearchTimeOut);
            }

            self.lastFilterSearch = now;

            self.filterSearchTimeOut = setTimeout(() => {

                app.config.set('bounds', app.browserWindows.main.getBounds());
                app.config.saveSync();

            }, 250);
        },

        initShortcuts: function() {

            // Global shortcuts - Player
            globalShortcut.register('MediaPlayPause', () => {
                AppActions.player.playToggle();
            });

            globalShortcut.register('MediaPreviousTrack', () => {
                AppActions.player.previous();
            });

            globalShortcut.register('MediaNextTrack', () => {
                AppActions.player.next();
            });
        }
    }
};

export default AppActions;
