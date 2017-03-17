import { globalShortcut } from 'electron';

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

    // Initialize all app components
    dispatch(lib.actions.library.load());
    dispatch(lib.actions.playlists.refresh());
    lib.actions.settings.check();
    initShortcuts();
}

export default library;
