const library = (lib) => {
    const store = lib.store;
    const dispatch = store.dispatch;
    const { config } = store.getState();

    // Prevent some events
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    // load data and apply app settings
    dispatch(lib.actions.tracks.find());
    dispatch(lib.actions.playlists.refresh());
    dispatch(lib.actions.settings.check());

    // Scan network for peers
    dispatch(lib.actions.network.scan());

    // Set player properties from config
    dispatch(lib.actions.player.setVolume(config.volume));
    dispatch(lib.actions.player.setMuted(config.muted));
    dispatch(lib.actions.player.setPlaybackRate(config.playbackRate));
};

export default library;
