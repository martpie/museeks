const { forwardToRenderer, triggerAlias, replayActionMain, } = require('electron-redux');
const { applyMiddleware, createStore } = require('redux');
const { aliasReceive, aliasResponse }  = require('../../shared/modules/alias');
const lib           = require('../library');
const thunk         = require('redux-thunk');
const createLogger  = require('redux-logger');
const reducers      = require('../../shared/redux/reducers/index');
const initialState  = require('../../shared/reducers/initial-state');

// Create and configure the logger
const logger        = createLogger({ collapsed : true });
// Create the middleware
const middleware    = [
    triggerAlias,
    thunk,
    new aliasReceive(lib, 'mainThread'),
    new aliasResponse('mainThread'),
    logger,
    forwardToRenderer
];
const store         = createStore(reducer, initialState, applyMiddleware(...middleware));

module.exports = store;
