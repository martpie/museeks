import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../utils/app';

const ipcRenderer = electron.ipcRenderer;



export default {

    checkTheme: function() {
        let themeName = app.config.get('theme');
        document.querySelector('body').classList.add('theme-' + themeName);
    },

    toggleDarkTheme: function() {

        let oldTheme = app.config.get('theme');
        let newTheme = oldTheme === 'light' ? 'dark' : 'light';

        document.querySelector('body').classList.remove('theme-' + oldTheme);
        document.querySelector('body').classList.add('theme-' + newTheme);

        app.config.set('theme', newTheme);
        app.config.saveSync();

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_REFRESH_CONFIG
        });
    },

    checkDevMode: function() {
        if(app.config.get('devMode')) app.browserWindows.main.openDevTools();
    },

    toggleSleepBlocker: function(mode) {

        app.config.set('sleepBlocker', !app.config.get('sleepBlocker'));
        app.config.saveSync();

        ipcRenderer.send('toggleSleepBlocker', app.config.get('sleepBlocker'), mode);

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_REFRESH_CONFIG
        });
    },

    toggleDevMode: function() {

        app.config.set('devMode', !app.config.get('devMode'));

        // Open dev tools if needed
        if(app.config.get('devMode')) app.browserWindows.main.openDevTools();
        else app.browserWindows.main.closeDevTools();

        app.config.saveSync();

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_REFRESH_CONFIG
        });
    },

    refreshProgress: function(percentage) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_LIBRARY_REFRESH_PROGRESS,
            percentage : percentage
        });
    }
}
