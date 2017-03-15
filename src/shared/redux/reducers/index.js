const app = require('./app');
const library = require('./library');
const toasts = require('./toasts');
const player = require('./player');
const playlists = require('./playlists');
const network = require('./network');
const queue = require('./queue');

const reducers = [
    app,
    library,
    toasts,
    player,
    playlists,
    network,
    queue
];

export default (state, action) => {
    return reducers.reduce((currentState, reducer) => {
        return reducer(currentState, action);
    }, state);
};
