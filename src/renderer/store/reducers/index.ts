import { combineReducers } from '@reduxjs/toolkit';

import library from './library';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  library,
});

export default rootReducer;
