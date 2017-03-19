import { ipcRenderer } from 'electron';

const library = (store, lib) => {
console.log(store)
    const dispatch = store.dispatch;
    const config = store.getState().config;

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

    // Config the audio player
    lib.player.setAudioVolume(config.audioVolume);
    lib.player.setAudioPlaybackRate(config.audioPlaybackRate);
    lib.player.setAudioMuted(config.audioMuted);

    // Listen for main-process events
    ipcRenderer.on('close', () => {
        dispatch(lib.actions.app.close());
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

    // load data and apply app settings
    dispatch(lib.actions.library.load());
    dispatch(lib.actions.playlists.refresh());
    dispatch(lib.actions.settings.check());
}

export default library;
