import { combineReducers } from 'redux';

import app, { AppState } from './app';
import library, { LibraryState } from './library';
import toasts, { ToastsState } from './toasts';
import player, { PlayerState } from './player';
import playlists, { PlaylistsState } from './playlists';

export interface RootState {
  app: AppState;
  library: LibraryState;
  toasts: ToastsState;
  player: PlayerState;
  playlists: PlaylistsState;
}

const rootReducer = combineReducers({
  app,
  library,
  toasts,
  player,
  playlists
});

export default rootReducer;
