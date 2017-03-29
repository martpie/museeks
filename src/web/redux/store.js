import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
//import reducers from '../../shared/redux/reducers';
import throttle from 'redux-throttle';
const reducers = () => {};

const initialState = {};

// Create and configure the logger
const logger = createLogger({
    collapsed: true,
    predicate: (getState, action) => {
        return ![
            'PLAYER/SET_VOLUME',
            'PLAYER/UPDATE_ELAPSED_TIME'
        ].includes(action.type);
    }
});

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware(),
    throttle(300),
    logger
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

export default store;
