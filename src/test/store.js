import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import reducers from '../shared/redux/reducers';

import initialState from '../electron/redux/initialState';

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware()
];

const store = createStore(reducers, initialState, applyMiddleware(...middleware));

export default store;
