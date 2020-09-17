import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import rootReducer, { RootState } from './reducers';

const logger = createLogger({
  collapsed: true,
});

const middlewares = applyMiddleware(thunk, logger);
const store: Store<RootState> = createStore(rootReducer, middlewares);

export default store;
