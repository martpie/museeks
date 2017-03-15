const flatten = require('flatten');

const actions = [

    'APP_REFRESH_LIBRARY',
    'APP_REFRESH_CONFIG',

    'APP_FILTER_SEARCH',

    'APP_PLAYER_START',
    'APP_PLAYER_TOGGLE',
    'APP_PLAYER_PLAY',
    'APP_PLAYER_PAUSE',
    'APP_PLAYER_STOP',
    'APP_PLAYER_NEXT',
    'APP_PLAYER_PREVIOUS',
    'APP_PLAYER_JUMP_TO',

    'APP_PLAYER_SHUFFLE',
    'APP_PLAYER_REPEAT',

    'APP_QUEUE_START',
    'APP_QUEUE_CLEAR',
    'APP_QUEUE_REMOVE',
    'APP_QUEUE_ADD',
    'APP_QUEUE_ADD_NEXT',
    'APP_QUEUE_SET_QUEUE',

    'APP_LIBRARY_ADD_FOLDERS',
    'APP_LIBRARY_REMOVE_FOLDER',
    'APP_LIBRARY_RESET',
    'APP_LIBRARY_REFRESH',
    'APP_LIBRARY_REFRESH_PROGRESS',
    'APP_LIBRARY_SET_TRACKSCURSOR',
    'APP_LIBRARY_FETCHED_COVER',

    'APP_PLAYLISTS_REFRESH',
    'APP_PLAYLISTS_LOAD_ONE',

    'APP_TOAST_ADD',
    'APP_TOAST_REMOVE',

    'APP_NOTIFICATION_NEW',

    'APP_NETWORK_PEER_FOUND'
];

// create promise events for all actions
const promisifyActions = (actions) => {
    return flatten(actions.map((action) => [
        `${action}`,
        `${action}_PENDING`,
        `${action}_FULFILLED`,
        `${action}_REJECTED`
    ]));
}

// manual keymirror function
const objectifyActions = (actions) => actions.reduce((AppConstants, action) => {
    AppConstants[action] = action;
    return AppConstants;
}, {});

const externalActions = objectifyActions(promisifyActions(actions));

module.exports = externalActions;
