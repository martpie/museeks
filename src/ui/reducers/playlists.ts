import types from '../constants/action-types';
import { PlaylistModel, Action } from '../../shared/types/interfaces';

export type PlaylistsState = {
  list: PlaylistModel[],
  loading: boolean
};

const initialState: PlaylistsState = {
  list: [],
  loading: true
};

export default (state = initialState, action: Action): PlaylistsState => {
  switch (action.type) {
    case (types.PLAYLISTS_REFRESH): {
      return {
        list: action.payload.playlists,
        loading: false
      };
    }

    case (types.LIBRARY_RESET): {
      return initialState;
    }

    default: {
      return state;
    }
  }
};
