import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import rootReducer from './reducers/index';

const logger = createLogger({
  collapsed: true,
});

const middlewares = applyMiddleware(thunk, logger);
const store = createStore(rootReducer, middlewares);

export default store;
