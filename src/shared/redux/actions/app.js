const library = (lib) => {

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

    return {
        close,
        maximize,
        minimize,
    }
}

module.exports = library;
