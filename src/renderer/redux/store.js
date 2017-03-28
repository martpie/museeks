import { applyMiddleware, createStore } from 'redux';
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'electron-redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import reducers from '../../shared/redux/reducers';
import sendToObservers from './middleware/sendToObservers';

const initialState = getInitialStateRenderer();

// Create and configure the logger
const logger = createLogger({ collapsed : true });

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware(),
    sendToObservers,
    forwardToMain,
    logger
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

// replay renderer actions in electron
replayActionRenderer(store);

export default store;
