import store from '../store.js';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app from '../lib/app';

import semver from 'semver';

const ipcRenderer = electron.ipcRenderer;


export default {

    check: function() {

        this.checkTheme();
        this.checkDevMode();
        this.checkSleepBlocker();
        if(app.config.get('autoUpdateChecker')) this.checkForUpdate({ silentFail: true });
    },

    checkTheme: function() {
        const themeName = app.config.get('theme');
        document.querySelector('body').classList.add(`theme-${themeName}`);
    },

    toggleDarkTheme: function() {

        const oldTheme = app.config.get('theme');
        const newTheme = oldTheme === 'light' ? 'dark' : 'light';

        document.querySelector('body').classList.remove(`theme-${oldTheme}`);
        document.querySelector('body').classList.add(`theme-${newTheme}`);

        app.config.set('theme', newTheme);
        app.config.saveSync();

        store.dispatch({
            type : AppConstants.APP_REFRESH_CONFIG
        });
    },

    toggleSleepBlocker: function(mode = 'prevent-app-suspension') {

        app.config.set('sleepBlocker', !app.config.get('sleepBlocker'));
        app.config.saveSync();

        ipcRenderer.send('toggleSleepBlocker', app.config.get('sleepBlocker'), mode);

        store.dispatch({
            type : AppConstants.APP_REFRESH_CONFIG
        });
    },

    checkSleepBlocker: function() {
        if(app.config.get('sleepBlocker')) ipcRenderer.send('toggleSleepBlocker', true, 'prevent-app-suspension');
    },

    toggleDevMode: function() {

        app.config.set('devMode', !app.config.get('devMode'));

        // Open dev tools if needed
        if(app.config.get('devMode')) app.browserWindows.main.webContents.openDevTools();
        else app.browserWindows.main.webContents.closeDevTools();

        app.config.saveSync();

        store.dispatch({
            type : AppConstants.APP_REFRESH_CONFIG
        });
    },

    checkDevMode: function() {
        if(app.config.get('devMode')) app.browserWindows.main.webContents.openDevTools();
    },

    toggleAutoUpdateChecker: function() {

        app.config.set('autoUpdateChecker', !app.config.get('autoUpdateChecker'));
        app.config.saveSync();

        store.dispatch({
            type : AppConstants.APP_REFRESH_CONFIG
        });
    },

    checkForUpdate: function(options = {}) {

        const currentVersion = app.version;

        const oReq = new XMLHttpRequest();

        oReq.onload = (e) => {

            const releases = e.currentTarget.response;
            let updateVersion = null;

            const isUpdateAvailable = releases.some((release) => {

                if(semver.valid(release.tag_name) !== null && semver.gt(release.tag_name, currentVersion)) {
                    updateVersion = release.tag_name;
                    return true;
                }

                return false;
            });

            if(isUpdateAvailable) AppActions.notifications.add('success', `Museeks ${updateVersion} is available, check http://museeks.io !`);
            else if(!options.silentFail) AppActions.notifications.add('success', `Museeks ${currentVersion} is the latest version available.`);
        };

        oReq.onerror = () => {

            AppActions.notifications.add('danger', 'An error occurred while checking updates.');
        };

        oReq.open('GET', 'https://api.github.com/repos/KeitIG/museeks/releases', true);
        oReq.responseType = 'json';
        oReq.send();
    },

    refreshProgress: function(percentage) {
        store.dispatch({
            type : AppConstants.APP_LIBRARY_REFRESH_PROGRESS,
            percentage
        });
    }
};
