const lib = require('../library');
const { applyMiddleware, createStore } = require('redux');
const { forwardToMain, replayActionRenderer, getInitialStateRenderer } = require('electron-redux');
const { promiseMiddleware } = require('redux-promise-middleware');
const { aliasReceive, aliasResponse } = require('../../shared/modules/alias');

const thunk = require('redux-thunk');
const createLogger = require('redux-logger');
const reducers = require('../../shared/redux/reducers');
const initialState = getInitialStateRenderer();
const logger = createLogger({ collapsed : true });

const middleware = [
    forwardToMain,
    thunk,
    new aliasReceive(lib, 'mainRenderer'),
    new aliasResponse('mainRenderer'),
    promiseMiddleware,
    logger
];

const store = createStore(reducer, initialState, applyMiddleware(...middleware));

export default store;
