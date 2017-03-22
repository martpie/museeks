const library = (lib) => {
    const store = lib.store;
    const dispatch = store.dispatch;
    const { config } = store.getState();

    const saveBounds = () => {
        const now = window.performance.now();

        if (now - self.lastFilterSearch < 250) {
            clearTimeout(self.filterSearchTimeOut);
        }

        self.lastFilterSearch = now;

        self.filterSearchTimeOut = setTimeout(() => {
            dispatch(lib.actions.config.set('bounds', lib.app.browserWindows.main.getBounds()));
        }, 250);
    };

    // Prevent some events
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    // Remember dimensions and positionning
    const currentWindow = lib.app.browserWindows.main;
    currentWindow.on('resize', saveBounds);
    currentWindow.on('move', saveBounds);

    // load data and apply app settings
    dispatch(lib.actions.network.find());
    dispatch(lib.actions.playlists.refresh());
    dispatch(lib.actions.settings.check());
}

export default library;
