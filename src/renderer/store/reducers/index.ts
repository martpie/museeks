import { combineReducers } from '@reduxjs/toolkit';

import library from './library';
import playlists from './playlists';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  library,
  playlists,
});

export default rootReducer;
