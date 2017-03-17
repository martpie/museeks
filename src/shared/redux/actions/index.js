const extend = require('xtend');

// take in a lib object with the environment specific implementations already supplied (renderer/electon)
const library = (lib) => {

    // hack so actions can depend on actions. fix later.
    const actions = {
        app : {},
        library : {},
        network : {},
        notification : {},
        player : {},
        playlists : {},
        queue : {},
        settings : {},
        toasts : {}
    }

    const libWithActions = extend(lib, { actions });

    const app = require('./app')(libWithActions);
    const library = require('./library')(libWithActions);
    const network = require('./network')(libWithActions);
    const notification = require('./notification')(libWithActions);
    const player = require('./player')(libWithActions);
    const playlists = require('./playlists')(libWithActions);
    const queue = require('./queue')(libWithActions);
    const settings = require('./settings')(libWithActions);
    const toasts = require('./toasts')(libWithActions);

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
