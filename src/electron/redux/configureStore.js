import { forwardToRenderer, replayActionMain } from 'electron-redux';
import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import reducers from '../../shared/redux/reducers/index';
import getInitialState from './getInitialState';

export default (config) => {
    // Create and configure the logger
    const logger = createLogger({ collapsed : true });

    // Create the middleware chain
    const middleware = [
        thunk,
        promiseMiddleware,
        logger,
        forwardToRenderer
    ];

    const store = createStore(reducers, getInitialState(config), applyMiddleware(...middleware));

    // replay electron actions in the renderer
    replayActionMain(store);

    return store;
}
