import app from '../utils/app';

import semver from 'semver';

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
        this.settings.checkTheme();
        this.settings.checkDevMode();
        this.settings.checkSleepBlocker();
        this.app.initShortcuts();
        this.app.start();

        // Audio Events
        app.audio.addEventListener('ended', AppActions.player.next);
        app.audio.addEventListener('error', AppActions.player.audioError);
        app.audio.addEventListener('play', () => {
            ipcRenderer.send('playerAction', 'play');
        });
        app.audio.addEventListener('pause', () => {
            ipcRenderer.send('playerAction', 'pause');
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
    },

    app: {

        start: function() {
            ipcRenderer.send('appReady');
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

            // Global shortcuts
            globalShortcut.register('MediaPlayPause', () => {
                AppActions.player.playToggle();
            });

            globalShortcut.register('MediaPreviousTrack', () => {
                AppActions.player.previous();
            });

            globalShortcut.register('MediaNextTrack', () => {
                AppActions.player.next();
            });
        },

        checkForUpdate: function() {

            const currentVersion = app.version;

            const oReq = new XMLHttpRequest();

            oReq.onload = (e) => {

                const releases = e.currentTarget.response;
                let updateVersion = null;

                const isUpdateAvailable = releases.some((release) => {

                    if(semver.gt(release.tag_name, currentVersion)) {
                        updateVersion = release.tag_name;
                        return true;
                    }

                    return false;
                });

                if(isUpdateAvailable) AppActions.notifications.add('success', `Museeks ${updateVersion} is available, check http://museeks.io !`);
                else AppActions.notifications.add('success', `Museeks ${currentVersion} is the latest version available.`);
            };

            oReq.onerror = () => {

                AppActions.notifications.add('danger', 'Could not check updates.');
            };

            oReq.open('GET', 'https://api.github.com/repos/KeitIG/museeks/releases', true);
            oReq.responseType = 'json';
            oReq.send();
        }
    }
};

export default AppActions;
