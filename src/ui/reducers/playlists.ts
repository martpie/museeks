import types from '../constants/action-types';
import { PlaylistModel, Action } from '../typings/interfaces';

export type PlaylistsState = PlaylistModel[];

const initialState: PlaylistsState = []; // Playlist[]

export default (state = initialState, action: Action): PlaylistsState => {
  switch (action.type) {
    case (types.APP_PLAYLISTS_REFRESH): {
      return action.payload.playlists;
    }

    case (types.APP_LIBRARY_RESET): {
      return initialState;
    }

    default: {
      return state;
    }
  }
};
