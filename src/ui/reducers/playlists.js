import types from '../constants/action-types';


const initialState = []; // Playlist[]

export default (state = initialState, payload) => {
  switch (payload.type) {
    case(types.APP_PLAYLISTS_REFRESH): {
      return payload.playlists;
    }

    case(types.APP_LIBRARY_RESET): {
      return initialState;
    }

    default: {
      return state;
    }
  }
};
