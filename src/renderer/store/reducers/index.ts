import { combineReducers } from '@reduxjs/toolkit';

import app from './app';
import library from './library';
import player from './player';
import playlists from './playlists';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  app,
  library,
  player,
  playlists,
});

export default rootReducer;
