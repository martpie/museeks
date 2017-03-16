const { applyMiddleware, createStore } = require('redux');
const { forwardToMain, replayActionRenderer, getInitialStateRenderer } = require('electron-redux');
const { promiseMiddleware } = require('redux-promise-middleware');
const lib          = require('../library');
const thunk        = require('redux-thunk');
const createLogger = require('redux-logger');
const reducers     = require('../../shared/redux/reducers');
const initialState = getInitialStateRenderer();

// Create and configure the logger
const logger       = createLogger({ collapsed : true });

// Create the middleware chain
const middleware = [
    forwardToMain,
    thunk,
    promiseMiddleware,
    logger
];

const store = createStore(reducer, initialState, applyMiddleware(...middleware));

export default store;
