import { applyMiddleware, createStore } from 'redux';
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'electron-redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import actionHost from 'redux-action-host';
import reducers from '../../shared/redux/reducers';
import sendToObservers from './middleware/sendToObservers';
import throttle from 'redux-throttle';

const initialState = getInitialStateRenderer();

// Create and configure the logger
const logger = createLogger({
    collapsed: true,
    predicate: (getState, action) => ![
        'PLAYER/SET_VOLUME',
        'PLAYER/UPDATE_ELAPSED_TIME'
    ].includes(action.type)
});

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware(),
    actionHost(),
    sendToObservers,
    throttle(300),
    forwardToMain,
    logger
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

// replay renderer actions in electron
replayActionRenderer(store);

export default store;
