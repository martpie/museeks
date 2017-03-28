import { throttle } from 'lodash';
const library = (lib) => {
    const store = lib.store;
    const dispatch = store.dispatch;
    const { config } = store.getState();

    // Prevent some events
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    // Remember dimensions and positionning
    const currentWindow = lib.app.browserWindows.main;

    // Save the bounds on resize
    const saveBounds = () => dispatch(lib.actions.config.set('bounds', lib.app.browserWindows.main.getBounds(), 3000));
    currentWindow.on('resize', saveBounds);
    currentWindow.on('move', saveBounds);

    // load data and apply app settings
    dispatch(lib.actions.tracks.find());
    dispatch(lib.actions.playlists.refresh());
    dispatch(lib.actions.settings.check());

    // Set player properties from config
    dispatch(lib.actions.player.setVolume(config.volume));
    dispatch(lib.actions.player.setMuted(config.muted));
    dispatch(lib.actions.player.setPlaybackRate(config.playbackRate));
}

export default library;
