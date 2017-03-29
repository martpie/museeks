import mutate from 'xtend/mutable';

import app from'./app';
import config from'./config';
import library from'./library';
import network from'./network';
import notification from'./notification';
import player from'./player';
import playlists from'./playlists';
import queue from'./queue';
import settings from'./settings';
import toasts from'./toasts';
import tracks from'./tracks';

// take in a lib object containing the environment specific implementation
// for the environment this is being run in (renderer/electron)
const lib = (lib) => {

    const actions = {
        app,
        config,
        library,
        network,
        notification,
        player,
        playlists,
        queue,
        settings,
        toasts,
        tracks
    };

    // create a copy of the library to attach actions to
    const libWithActions = mutate(lib, { actions: {} });

    // invoke each action library with the shared library object
    const sharedLib = Object.keys(actions).reduce((sharedLib, action) => {
        sharedLib.actions[action] = actions[action](sharedLib);
        return sharedLib;
    }, libWithActions);

    // return the actions object with the shared library reference
    return sharedLib.actions;
};

export default lib;
