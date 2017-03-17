import extend from 'xtend';

// take in a lib object with the environment specific
// implementation for the renderer or electon
const library = (lib) => {

    const actions = {
        app: require('./app'),
        config: require('./config'),
        library: require('./library'),
        network: require('./network'),
        notification: require('./notification'),
        player: require('./player'),
        playlists: require('./playlists'),
        queue: require('./queue'),
        settings: require('./settings'),
        toasts: require('./toasts')
    }

    // create a copy of the library to attach actions to
    const libWithActions = extend(lib, { actions : {} });

    const sharedLib = Object.keys(actions).reduce((sharedLib, action) => {
        // invoke each action library with the shared library object
        sharedLib.actions[action] = actions[action](sharedLib);
        return sharedLib;
    }, libWithActions);

    return sharedLib.actions;
}

module.exports = library;
