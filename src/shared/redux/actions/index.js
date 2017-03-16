const library = (lib) => {

    // invoke all shared libraries with the environment specific lib
    const app = require('./app')(lib);
    const library = require('./library')(lib);
    const network = require('./network')(lib);
    const notification = require('./notification')(lib);
    const player = require('./player')(lib);
    const playlists = require('./playlists')(lib);
    const queue = require('./queue')(lib);
    const settings = require('./settings')(lib);
    const toasts = require('./toasts')(lib);

    return {
        app,
        library,
        network,
        notification,
        player,
        playlists,
        queue,
        settings,
        toasts
    };
}

module.exports = library;
