import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import reducer from './reducers/index';
import initialState from './reducers/initial-state';

const logger = createLogger({ collapsed : true });
const store = createStore(
    reducer,
    initialState,
    applyMiddleware(thunk, logger)
);

export default store;
