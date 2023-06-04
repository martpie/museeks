/**
 * TODO:
 * - convert all current actions to redux-toolkit slices (is it a good idea?)
 * - add unit-tests for the slices/reducers
 */

import { configureStore, Store } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import rootReducer, { RootState } from './reducers';

const logger = createLogger({
  collapsed: true,
});

const store: Store<RootState> = configureStore({ reducer: rootReducer, middleware: [logger], devTools: true });

export default store;
