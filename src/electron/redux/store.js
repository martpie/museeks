import { applyMiddleware, createStore } from 'redux';
import { forwardToRenderer, replayActionMain } from 'electron-redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import throttle from 'redux-throttle';
import actionHost from 'redux-action-host';
import reducers from '../../shared/redux/reducers';

import initialState from './initialState';

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware(),
    actionHost(),
    throttle(300),
    forwardToRenderer
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

// replay electron actions in the renderer
replayActionMain(store);

export default store;
