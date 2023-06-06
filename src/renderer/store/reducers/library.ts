import types from '../action-types';
import { Action, SortBy, SortOrder } from '../../../shared/types/museeks';
import { stripAccents } from '../../../shared/lib/utils-id3';

export interface LibrarySort {
  by: SortBy;
  order: SortOrder;
}

export interface LibraryState {
  search: string;
  sort: LibrarySort;
  refreshing: boolean;
  refresh: {
    processed: number;
    total: number;
  };
  highlightPlayingTrack: boolean;
}

const initialState: LibraryState = {
  search: '',
  sort: window.MuseeksAPI.config.getx('librarySort'),
  refreshing: false,
  refresh: {
    processed: 0,
    total: 0,
  },
  highlightPlayingTrack: false,
};

export default function libraryReducer(state = initialState, action: Action): LibraryState {
  switch (action.type) {
    case types.LIBRARY_SORT: {
      const { sortBy } = action.payload;
      const prevSort = state.sort;

      if (sortBy === prevSort.by) {
        return {
          ...state,
          sort: {
            ...state.sort,
            order: prevSort.order === SortOrder.ASC ? SortOrder.DSC : SortOrder.ASC,
          },
        };
      }

      const sort: LibrarySort = {
        by: sortBy,
        order: SortOrder.ASC,
      };

      window.MuseeksAPI.config.set('librarySort', sort);
      window.MuseeksAPI.config.save();

      return {
        ...state,
        sort,
      };
    }

    case types.FILTER_SEARCH: {
      return {
        ...state,
        search: stripAccents(action.payload.search),
      };
    }

    // case (types.LIBRARY_ADD_FOLDERS): { // TODO Redux -> move to a thunk
    //   const { folders } = action.payload;
    //   let musicFolders = window.MuseeksAPI.config.get('musicFolders');

    //   // Check if we received folders
    //   if (folders !== undefined) {
    //     musicFolders = musicFolders.concat(folders);

    //     // Remove duplicates, useless children, ect...
    //     musicFolders = utils.removeUselessFolders(musicFolders);

    //     musicFolders.sort();

    //     window.MuseeksAPI.config.set('musicFolders', musicFolders);
    //     window.MuseeksAPI.config.saveSync();
    //   }

    //   return { ...state };
    // }

    // case (types.LIBRARY_REMOVE_FOLDER): { // TODO Redux -> move to a thunk
    //   if (!state.library.refreshing) {
    //     const musicFolders = window.MuseeksAPI.config.get('musicFolders');

    //     musicFolders.splice(action.index, 1);

    //     window.MuseeksAPI.config.set('musicFolders', musicFolders);
    //     window.MuseeksAPI.config.saveSync();

    //     return { ...state };
    //   }

    //   return state;
    // }

    case types.LIBRARY_RESET: {
      return initialState;
    }

    case types.LIBRARY_REFRESH_START: {
      return {
        ...state,
        refreshing: true,
      };
    }

    case types.LIBRARY_REFRESH_END: {
      return {
        ...state,
        refreshing: false,
        refresh: {
          processed: 0,
          total: 0,
        },
      };
    }

    case types.LIBRARY_REFRESH_PROGRESS: {
      return {
        ...state,
        refresh: {
          processed: action.payload.processed,
          total: action.payload.total,
        },
      };
    }

    case types.LIBRARY_HIGHLIGHT_PLAYING_TRACK: {
      return {
        ...state,
        highlightPlayingTrack: action.payload.highlight,
      };
    }

    default: {
      return state;
    }
  }
}
