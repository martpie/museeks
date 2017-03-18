import { globalShortcut } from 'electron';

const library = (store, lib) => {
    const { dispatch, getState } = store;

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
}

export default library;
