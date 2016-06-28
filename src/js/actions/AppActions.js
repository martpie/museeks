import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../utils/app';

const globalShortcut = electron.remote.globalShortcut;
const ipcRenderer    = electron.ipcRenderer;

import semver from 'semver';

import LibraryActions       from './LibraryActions';
import NotificationsActions from './NotificationsActions';
import PlayerActions        from './PlayerActions';
import QueueActions         from './QueueActions';
import SettingsActions      from './SettingsActions';



let AppActions = {

    player        : PlayerActions,
    queue         : QueueActions,
    library       : LibraryActions,
    settings      : SettingsActions,
    notifications : NotificationsActions,

    init: function() {

        // Usual tasks
        this.library.refreshTracks();
        this.settings.checkTheme();
        this.settings.checkDevMode();
        this.app.initShortcuts();
        this.app.start();

        // Prevent some events
        window.addEventListener('dragover', function (e) {
            e.preventDefault();
        }, false);

        window.addEventListener('drop', function (e) {
            e.preventDefault();
        }, false);

        // Remember dimensions and positionning
        let currentWindow = app.browserWindows.main;

        currentWindow.on('resize', function() {
            AppActions.app.saveBounds();
        });

        currentWindow.on('move', function() {
            AppActions.app.saveBounds();
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

            let self = AppActions;
            let now = window.performance.now();

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
            globalShortcut.register('MediaPlayPause', function () {
                AppActions.player.playToggle();
            });

            globalShortcut.register('MediaPreviousTrack', function () {
                AppActions.player.previous();
            });

            globalShortcut.register('MediaNextTrack', function () {
                AppActions.player.next();
            });
        },

        checkForUpdate: function() {

            let currentVersion = app.version;

            let oReq = new XMLHttpRequest();

            oReq.onload = (e) => {

                let releases = e.currentTarget.response;
                let updateVersion = null;

                let isUpdateAvailable = releases.some((release) => {

                    if(semver.gt(release.tag_name, currentVersion)) {
                        updateVersion = release.tag_name;
                        return true;
                    } else {
                        return false;
                    }
                });

                if(isUpdateAvailable) AppActions.notifications.add('success', 'Museeks ' + updateVersion + ' is available, check http://museeks.io !');
                else AppActions.notifications.add('success', 'Museeks ' + currentVersion + ' is the latest version available.');
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
