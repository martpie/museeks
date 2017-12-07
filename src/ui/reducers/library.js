import * as app from '../lib/app';
import types from '../constants/action-types';
import utils from '../utils/utils';


const initialState = {
  tracks: {
    library: {
      all: null,
      sub: null,
    },
    playlist: {
      all: null,
      sub: null,
    },
  },
  tracksCursor: 'library', // 'library' or 'playlist'
  refreshing: false,
  refresh: {
    processed: 0,
    total: 0,
  },
};


export default (state = initialState, payload) => {
  switch (payload.type) {
    case(types.APP_LIBRARY_REFRESH): {
      return {
        ...state,
        tracks: {
          library: {
            all: [...payload.tracks],
            sub: [...payload.tracks],
          },
          playlist: {
            all: [],
            sub: [],
          },
        },
      };
    }

    case(types.APP_FILTER_SEARCH): {
      if(!payload.search) {
        const newState = { ...state };
        newState.tracks[state.tracksCursor].sub = [...state.tracks[state.tracksCursor].all];

        return newState;
      }

      const search = utils.stripAccents(payload.search);

      const allCurrentTracks = state.tracks[state.tracksCursor].all;
      const tracks = [].concat(allCurrentTracks).filter((track) => { // Problem here
        return track.loweredMetas.artist.join(', ').includes(search)
          || track.loweredMetas.album.includes(search)
          || track.loweredMetas.genre.join(', ').includes(search)
          || track.loweredMetas.title.includes(search);
      });

      const newState = { ...state };
      newState.tracks[state.tracksCursor].sub = tracks;

      return newState;
    }

    case(types.APP_LIBRARY_ADD_FOLDERS): { // TODO Redux -> move to a thunk
      const{ folders } = payload;
      let musicFolders = app.config.get('musicFolders');

      // Check if we received folders
      if(folders !== undefined) {
        musicFolders = musicFolders.concat(folders);

        // Remove duplicates, useless children, ect...
        musicFolders = utils.removeUselessFolders(musicFolders);

        musicFolders.sort();

        app.config.set('musicFolders', musicFolders);
        app.config.saveSync();
      }

      return { ...state };
    }

    case(types.APP_LIBRARY_REMOVE_FOLDER): { // TODO Redux -> move to a thunk
      if(!state.library.refreshing) {
        const musicFolders = app.config.get('musicFolders');

        musicFolders.splice(payload.index, 1);

        app.config.set('musicFolders', musicFolders);
        app.config.saveSync();

        return { ...state };
      }

      return state;
    }

    case(types.APP_LIBRARY_RESET): {
      // nothing here for the moment
      return state;
    }

    case(types.APP_LIBRARY_REFRESH_START): {
      return {
        ...state,
        refreshing: true,
      };
    }

    case(types.APP_LIBRARY_REFRESH_END): {
      return {
        ...state,
        refreshing: false,
        refresh : {
          processed: 0,
          total: 0,
        },
      };
    }

    case(types.APP_LIBRARY_REFRESH_PROGRESS): {
      return {
        ...state,
        refresh : {
          processed: payload.processed,
          total: payload.total,
        },
      };
    }

    case(types.APP_LIBRARY_REMOVE_TRACKS): {
      const tracksIds = payload.tracksIds;
      const removeTrack = (track) => !tracksIds.includes(track._id);
      const tracks = {
        library: {
          all: [...state.tracks.library.all].filter(removeTrack),
          sub: [...state.tracks.library.sub].filter(removeTrack),
        },
        playlist: {
          all: [...state.tracks.playlist.all].filter(removeTrack),
          sub: [...state.tracks.playlist.sub].filter(removeTrack),
        },
      };

      return {
        ...state,
        tracks,
        refreshProgress : payload.percentage,
      };
    }

    case(types.APP_LIBRARY_SET_TRACKSCURSOR): {
      return {
        ...state,
        tracksCursor: payload.cursor,
      };
    }

    case(types.APP_PLAYLISTS_LOAD_ONE): {
      const newState = { ...state };
      newState.tracks[state.tracksCursor] = {
        all: [...payload.tracks],
        sub: [...payload.tracks],
      };
      return newState;
    }

    default: {
      return state;
    }
  }
};
