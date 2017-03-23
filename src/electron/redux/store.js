import { applyMiddleware, createStore } from 'redux';
import { forwardToRenderer, replayActionMain } from 'electron-redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import reducers from '../../shared/redux/reducers';

import initialState from './initialState';

// Create and configure the logger
const logger = createLogger({ collapsed : true });

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware(),
    // logger,
    forwardToRenderer
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

// replay electron actions in the renderer
replayActionMain(store);

export default store;
