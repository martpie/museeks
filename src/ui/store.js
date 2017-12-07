import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import rootReducer from './reducers/index';

const middlewares = applyMiddleware(thunk, logger);
const store = createStore(rootReducer, middlewares);

export default store;
