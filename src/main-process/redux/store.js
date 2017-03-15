const { applyMiddleware, createStore } = require('redux');
const { forwardToRenderer, triggerAlias, replayActionMain, } = require('electron-redux');

const thunk         = require('redux-thunk');
const createLogger  = require('redux-logger');
const reducers      = require('../shared/redux/reducers/index');
const initialState  = require('../shared/reducers/initial-state');

const logger        = createLogger({ collapsed : true });
const middleware    = [ triggerAlias, thunk, logger, forwardToRenderer ];
const store         = createStore(reducer, initialState, applyMiddleware(...middleware));

export default store;

