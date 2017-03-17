const { forwardToRenderer, replayActionMain, } = require('electron-redux');
const { applyMiddleware, createStore } = require('redux');
const promiseMiddleware = require('redux-promise-middleware');
const thunk           = require('redux-thunk');
const createLogger    = require('redux-logger');
const reducers        = require('../../shared/redux/reducers/index');
const getInitialState = require('./getInitialState');

module.exports = (config) => {
    // Create and configure the logger
    const logger = createLogger({ collapsed : true });

    // Create the middleware chain
    const middleware = [
        thunk.default,
        promiseMiddleware.default,
        logger,
        forwardToRenderer
    ];

    const store = createStore(reducers, getInitialState(config), applyMiddleware(...middleware));

    // replay electron actions in the renderer
    replayActionMain(store);

    return store;
}
