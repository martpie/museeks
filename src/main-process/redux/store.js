const lib = require('./library');
const { applyMiddleware, createStore } = require('redux');
const { forwardToRenderer, triggerAlias, replayActionMain, } = require('electron-redux');
const { aliasReceive, aliasResponse } = require('../shared/modules/alias');

const thunk         = require('redux-thunk');
const createLogger  = require('redux-logger');
const reducers      = require('../shared/redux/reducers/index');
const initialState  = require('../shared/reducers/initial-state');

const logger        = createLogger({ collapsed : true });
const middleware    = [
    triggerAlias,
    thunk,
    new aliasReceive(lib),
    new aliasResponse(),
    logger,
    forwardToRenderer
];
const store         = createStore(reducer, initialState, applyMiddleware(...middleware));

export default store;

