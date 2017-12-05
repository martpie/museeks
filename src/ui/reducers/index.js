import { combineReducers } from 'redux';

import app from './app';
import library from './library';
import toasts from './toasts';
import player from './player';
import playlists from './playlists';

const rootReducer = combineReducers({
  app,
  library,
  toasts,
  player,
  playlists,
});

export default rootReducer;
