import semver from 'semver';

const library = (lib) => {

    const check = () => (dispatch, getState) => {
        const { config } = getState();

        // set theme
        document.querySelector('body').classList.add(`theme-${config.theme}`);

        // set dev mode
        if (config.devMode) lib.app.browserWindows.main.webContents.openDevTools();

        // set sleep mode
        if (config.sleepBlocker) lib.app.toggleSleepBlocker(true, 'prevent-app-suspension');

        // check for updates
        if (config.autoUpdateChecker) checkForUpdate({ silentFail: true });
    };

    const toggleDarkTheme = (value) => (dispatch) => {
        const oldTheme = value ? 'light' : 'dark';
        const newTheme = value ? 'dark' : 'light';

        document.querySelector('body').classList.remove(`theme-${oldTheme}`);
        document.querySelector('body').classList.add(`theme-${newTheme}`);

        dispatch(lib.actions.config.set('theme', newTheme));

        return {
        };
    };

    const toggleSleepBlocker = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('sleepBlocker', value));

        lib.app.toggleSleepBlocker(value, 'prevent-app-suspension');
    };

    const toggleDevMode = (value) => (dispatch) => {

        // Open dev tools if needed
        if (value) lib.app.browserWindows.main.webContents.openDevTools();
        else lib.app.browserWindows.main.webContents.closeDevTools();

        dispatch(lib.actions.config.set('devMode', value));
    };

    const toggleAutoUpdateChecker = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('autoUpdateChecker', value));
    };

    const checkForUpdate = (options = {}) => (dispatch) => {
        const currentVersion = lib.app.version;

        return fetch('https://api.github.com/repos/KeitIG/museeks/releases')
        .then((response) => response.json())
        .then((releases) => {

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
        });
    };

    const toggleNativeFrame = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('useNativeFrame', value));
        lib.app.restart();
    };

    const toggleMinimizeToTray = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('minimizeToTray', value));
    };

    const refreshProgress = (percentage) => (dispatch) => {
        dispatch({
            type: 'LIBRARY/RESCAN_PROGRESS',
            payload: {
                percentage
            }
        });
    };

    const toggleDisplayNotifications = (value) => (dispatch) => {
        dispatch(lib.actions.config.set('displayNotifications', value));
    };

    return {
        check,
        checkForUpdate,
        refreshProgress,
        toggleAutoUpdateChecker,
        toggleDarkTheme,
        toggleDevMode,
        toggleDisplayNotifications,
        toggleMinimizeToTray,
        toggleNativeFrame,
        toggleSleepBlocker
    };
};

export default library;
