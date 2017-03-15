import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import createLogger from 'redux-logger';

import reducer from './reducers/index';
import initialState from './reducers/initial-state';

const logger = createLogger();
const store = createStore(
    reducer,
    initialState,
    applyMiddleware(thunk, promise, logger)
);

export default store;
