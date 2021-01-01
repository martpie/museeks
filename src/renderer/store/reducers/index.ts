import { combineReducers } from '@reduxjs/toolkit';

import app from './app';
import library from './library';
import toasts from './toasts';
import player from './player';
import playlists from './playlists';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  app,
  library,
  toasts,
  player,
  playlists,
});

export default rootReducer;
