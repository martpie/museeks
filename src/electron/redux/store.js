const { forwardToRenderer, replayActionMain, } = require('electron-redux');
const { applyMiddleware, createStore } = require('redux');
const { promiseMiddleware } = require('redux-promise-middleware');
const thunk         = require('redux-thunk');
const createLogger  = require('redux-logger');
const reducers      = require('../../shared/redux/reducers/index');
const initialState  = require('../../shared/reducers/initial-state');

// Create and configure the logger
const logger        = createLogger({ collapsed : true });

// Create the middleware chain
const middleware    = [
    thunk,
    promiseMiddleware,
    logger,
    forwardToRenderer
];
const store         = createStore(reducer, initialState, applyMiddleware(...middleware));

module.exports = store;
