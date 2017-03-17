const semver = require('semver');
const { ipcRenderer } = require('electron');

const library = (lib) => {

    const check = () => {
        checkTheme();
        checkDevMode();
        checkSleepBlocker();
        // if (getState().config.autoUpdateChecker) checkForUpdate({ silentFail: true }); TODO
    };

    const checkTheme = () => {
        // const themeName = getState().config.theme; TODO
        // document.querySelector('body').classList.add(`theme-${themeName}`);
    };

    const toggleDarkTheme = (value) => (dispatch) => {
        const oldTheme = value ? 'light' : 'dark';
        const newTheme = value ? 'dark' : 'light';

        document.querySelector('body').classList.remove(`theme-${oldTheme}`);
        document.querySelector('body').classList.add(`theme-${newTheme}`);

        dispatch(lib.actions.config.set('theme', newTheme));
        dispatch(lib.actions.config.save());

        return {
            type: 'APP_REFRESH_CONFIG'
        };
    };

    const toggleSleepBlocker = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('sleepBlocker', value));
        dispatch(lib.actions.config.save());

        ipcRenderer.send('toggleSleepBlocker', value, 'prevent-app-suspension');

        dispatch({
            type: 'APP_REFRESH_CONFIG'
        });
    };

    const checkSleepBlocker = () => (dispatch, getState) => {
        if (getState().config.sleepBlocker) {
            ipcRenderer.send('toggleSleepBlocker', true, 'prevent-app-suspension');
        }
    };

    const toggleDevMode = (value) => (dispatch) => {

        // Open dev tools if needed
        if (value) lib.app.browserWindows.main.webContents.openDevTools();
        else lib.app.browserWindows.main.webContents.closeDevTools();

        dispatch(lib.actions.config.set('devMode', value));
        dispatch(lib.actions.config.save());

        dispatch({
            type: 'APP_REFRESH_CONFIG'
        });
    };

    const checkDevMode = () => (dispatch, getState) => {
        if (getState().config.devMode) lib.app.browserWindows.main.webContents.openDevTools();
    };

    const toggleAutoUpdateChecker = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('autoUpdateChecker', value));
        dispatch(lib.actions.config.save());

        dispatch({
            type: 'APP_REFRESH_CONFIG'
        });
    };

    const checkForUpdate = async (options = {}) => {
        const currentVersion = lib.app.version;

        try {
            const response = await fetch('https://api.github.com/repos/KeitIG/museeks/releases');
            const releases = await response.json();

            const newRelease = releases.find((release) => {
                return semver.valid(release.tag_name) !== null && semver.gt(release.tag_name, currentVersion);
            });

            let message;
            if (newRelease) {
                message = `Museeks ${newRelease.tag_name} is available, check http://museeks.io !`;
            } else if (!options.silentFail) {
                message = `Museeks ${currentVersion} is the latest version available.`;
            }

            if (message) {
                dispatch(lib.actions.toasts.add('success', message));
            }
        } catch (e) {
            if (!options.silentFail) dispatch(lib.actions.toasts.add('danger', 'An error occurred while checking updates.'));
        }
    };

    const toggleNativeFrame = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('useNativeFrame', value));
        dispatch(lib.actions.config.save());
        dispatch(lib.actions.app.restart());
    };

    const toggleMinimizeToTray = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('minimizeToTray', value));
        dispatch(lib.actions.config.save());

        dispatch({
            type: 'APP_REFRESH_CONFIG'
        });
    };

    const refreshProgress = (percentage) => (dispatch) => {
        dispatch({
            type: 'APP_LIBRARY_REFRESH_PROGRESS',
            percentage
        });
    };

    const toggleDisplayNotifications = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('displayNotifications', value));
        dispatch(lib.actions.config.save());

        dispatch({
            type: 'APP_REFRESH_CONFIG'
        });
    };

    return {
        check,
        checkDevMode,
        checkForUpdate,
        checkSleepBlocker,
        checkTheme,
        refreshProgress,
        toggleAutoUpdateChecker,
        toggleDarkTheme,
        toggleDevMode,
        toggleDisplayNotifications,
        toggleMinimizeToTray,
        toggleNativeFrame,
        toggleSleepBlocker
    }
}

module.exports = library;
