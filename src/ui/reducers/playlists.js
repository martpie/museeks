import types from '../constants/action-types';


const initialState = null; // Playlist[]

export default (state = initialState, payload) => {
  switch (payload.type) {
    case(types.APP_PLAYLISTS_REFRESH): {
      return payload.playlists;
    }

    default: {
      return state;
    }
  }
};
