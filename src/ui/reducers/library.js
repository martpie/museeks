import * as app from '../lib/app';
import types from '../constants/action-types';
import utils from '../utils/utils';
import { ARTIST, ASC, DSC } from '../constants/sort-types';


const initialState = {
  tracks: {
    library: [],
    playlist: [],
  },
  search: '',
  sort: {
    by: ARTIST,
    order: ASC,
  },
  loading: true,
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
          library: [...payload.tracks],
          playlist: [],
        },
        loading: false,
      };
    }

    case(types.APP_LIBRARY_SORT): {
      const { sortBy } = payload;
      const prevSort = state.sort;

      if (sortBy === prevSort.by) {
        return {
          ...state,
          sort: {
            ...state.sort,
            order: prevSort.order === ASC ? DSC : ASC,
          },
        };
      }

      return {
        ...state,
        sort: {
          by: sortBy,
          order: ASC,
        },
      };
    }

    case(types.APP_FILTER_SEARCH): {
      return {
        ...state,
        search: utils.stripAccents(payload.search),
      };
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
      return initialState;
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
        library: [...state.tracks.library].filter(removeTrack),
        playlist: [...state.tracks.playlist].filter(removeTrack),
      };

      return {
        ...state,
        tracks,
        refreshProgress : payload.percentage,
      };
    }

    case(types.APP_PLAYLISTS_LOAD_ONE): {
      const newState = { ...state };
      newState.tracks.playlist = [...payload.tracks];

      return newState;
    }

    default: {
      return state;
    }
  }
};
