const { applyMiddleware, createStore } = require('redux');
const { forwardToMain, replayActionRenderer, getInitialStateRenderer } = require('electron-redux');
const promiseMiddleware = require('redux-promise-middleware');
const thunk        = require('redux-thunk');
const createLogger = require('redux-logger');
const reducers     = require('../../shared/redux/reducers');
const initialState = getInitialStateRenderer();

// Create and configure the logger
const logger       = createLogger({ collapsed : true });

// Create the middleware chain
const middleware = [
    forwardToMain,
    thunk.default,
    promiseMiddleware.default,
    logger
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

export default store;
