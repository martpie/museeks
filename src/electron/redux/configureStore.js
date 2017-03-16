const { forwardToRenderer, replayActionMain, } = require('electron-redux');
const { applyMiddleware, createStore } = require('redux');
const { promiseMiddleware } = require('redux-promise-middleware');
const thunk           = require('redux-thunk');
const createLogger    = require('redux-logger');
const reducers        = require('../../shared/redux/reducers/index');
const getInitialState = require('./getInitialState');

export default (config) => {
    // Create and configure the logger
    const logger    = createLogger({ collapsed : true });

    // Create the middleware chain
    const middleware = [
        thunk,
        promiseMiddleware,
        logger,
        forwardToRenderer
    ];

    return createStore(reducer, getInitialState(config), applyMiddleware(...middleware));
}
