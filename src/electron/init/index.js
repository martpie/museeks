const { globalShortcut } = require('electron');

const library = (store, lib) => {
    const { dispatch, getState } = store;

    const initShortcuts = () => {
        // Global shortcuts - Player
        globalShortcut.register('MediaPlayPause', () => {
            dispatch(lib.actions.player.playToggle());
        });

        globalShortcut.register('MediaPreviousTrack', () => {
            dispatch(lib.actions.player.previous());
        });

        globalShortcut.register('MediaNextTrack', () => {
            dispatch(lib.actions.player.next());
        });
    };

    // Usual tasks
    dispatch(lib.actions.library.load());
    dispatch(lib.actions.playlist.refresh());
    dispatch(lib.actions.settings.check());
    initShortcuts();
}

module.exports = library;
