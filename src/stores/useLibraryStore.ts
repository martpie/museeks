import { ask, open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

import logger from '../lib/logger';
import router from '../views/router';
import channels from '../lib/ipc-channels';
import { SortBy, SortOrder } from '../generated/typings';
import config from '../lib/config';

import { createStore } from './store-helpers';
import usePlayerStore from './usePlayerStore';
import useToastsStore from './useToastsStore';

type LibraryState = {
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  refreshing: boolean;
  refresh: {
    processed: number;
    total: number;
  };
  highlightPlayingTrack: boolean;
  api: {
    search: (value: string) => void;
    sort: (sortBy: SortBy) => void;
    add: () => Promise<void>;
    remove: (tracksIDs: string[]) => Promise<void>;
    reset: () => Promise<void>;
    // updateTrackMetadata: (
    //   trackID: string,
    //   newFields: TrackEditableFields
    // ) => Promise<void>;
    highlightPlayingTrack: (highlight: boolean) => void;
  };
};

const useLibraryStore = createStore<LibraryState>((set, get) => ({
  search: '',
  // TODO: get from config
  sortBy: config.getInitial('library_sort_by'),
  sortOrder: config.getInitial('library_sort_order'),
  refreshing: false,
  refresh: {
    processed: 0,
    total: 0,
  },
  highlightPlayingTrack: false, // hacky, fixme

  api: {
    /**
     * Filter tracks by search
     */
    search: (search): void => {
      set({ search });
    },

    /**
     * Filter tracks by sort query
     */
    sort: async (sortBy): Promise<void> => {
      const prevSortBy = get().sortBy;
      const prevSortOrder = get().sortOrder;

      let sortOrder: SortOrder;

      // If same sort by, just reverse the order
      if (sortBy === prevSortBy) {
        sortOrder = prevSortOrder === 'Asc' ? 'Dsc' : 'Asc';
      }

      // If it's different, then we assume the user needs ASC order by default
      else {
        sortOrder = 'Asc';
      }

      await config.set('library_sort_by', sortBy);
      await config.set('library_sort_order', sortOrder);

      set({ sortBy, sortOrder });
    },

    /**
     * Add tracks to Library
     */
    add: async (): Promise<void> => {
      try {
        const result = await open({
          multiple: true,
          directory: true,
        });

        if (result == null) {
          return;
        }

        set({ refreshing: true });
        await invoke('plugin:database|import_tracks_to_library', {
          importPaths: result,
        });
        // TODO: re-implement progress
        // TODO: scan and import playlists

        router.revalidate();
        return;
      } catch (err) {
        useToastsStore
          .getState()
          .api.add('danger', 'An error occured when scanning the library');
        logger.warn(err);
        return;
      } finally {
        set({
          refreshing: false,
          refresh: { processed: 0, total: 0 },
        });
      }
    },

    /**
     * remove tracks from library
     */
    remove: async (tracksIDs) => {
      // not calling await on it as it calls the synchonous message box
      const options: Electron.MessageBoxOptions = {
        buttons: ['Cancel', 'Remove'],
        title: 'Remove tracks from library?',
        message: `Are you sure you want to remove ${tracksIDs.length} element(s) from your library?`,
        type: 'warning',
      };

      const result: MessageBoxReturnValue = await ipcRenderer.invoke(
        channels.DIALOG_MESSAGE_BOX,
        options,
      );

      if (result.response === 1) {
        // button possition, here 'remove'
        // Remove tracks from the Track collection
        await db.tracks.remove(tracksIDs);

        router.revalidate();
        // That would be great to remove those ids from all the playlists, but it's not easy
        // and should not cause strange behaviors, all PR for that would be really appreciated
        // TODO: see if it's possible to remove the IDs from the selected state of TracksList as it "could" lead to strange behaviors
      }
    },

    /**
     * Reset the library
     */
    reset: async (): Promise<void> => {
      usePlayerStore.getState().api.stop();
      try {
        const confirmed = await ask(
          'All your tracks and playlists will be deleted from Museeks.',
          'Are you sure you want to reset your library?',
        );

        if (confirmed) {
          await invoke('reset_database');
          router.revalidate();
        }
      } catch (err) {
        logger.error(err);
      }
    },

    // /**
    //  * Update the id3 attributes.
    //  * IMPROVE ME: add support for writing metadata (hint: node-id3 does not work
    //  * well).
    //  *
    //  * @param trackID The ID of the track to update
    //  * @param newFields The fields to be updated and their new value
    //  */
    // updateTrackMetadata: async (
    //   trackID: string,
    //   newFields: TrackEditableFields
    // ): Promise<void> => {
    //   let track = await db.tracks.findOnlyByID(trackID);

    //   track = {
    //     ...track,
    //     ...newFields,
    //     loweredMetas: getLoweredMeta(newFields),
    //   };

    //   if (!track) {
    //     throw new Error("No track found while trying to update track metadata");
    //   }

    //   await db.tracks.update(track);

    //   router.revalidate();
    // },

    /**
     * Set highlight trigger for a track
     * FIXME: very hacky, and not great, should be done another way
     */
    highlightPlayingTrack: (highlight: boolean): void => {
      set({ highlightPlayingTrack: highlight });
    },
  },

  // Old code used to manage folders to be scanned, to be re-enabled one day
  // case (types.LIBRARY_ADD_FOLDERS): { // TODO Redux -> move to a thunk
  //   const { folders } = action.payload;
  //   let musicFolders = window.MuseeksAPI.config.get('musicFolders');

  //   // Check if we received folders
  //   if (folders !== undefined) {
  //     musicFolders = musicFolders.concat(folders);

  //     // Remove duplicates, useless children, ect...
  //     musicFolders = utils.removeUselessFolders(musicFolders);

  //     musicFolders.sort();

  //     config.set('musicFolders', musicFolders);
  //   }

  //   return { ...state };
  // }

  // case (types.LIBRARY_REMOVE_FOLDER): { // TODO Redux -> move to a thunk
  //   if (!state.library.refreshing) {
  //     const musicFolders = window.MuseeksAPI.config.get('musicFolders');

  //     musicFolders.splice(action.index, 1);

  //     config.set('musicFolders', musicFolders);

  //     return { ...state };
  //   }

  //   return state;
  // }
}));

export default useLibraryStore;

export function useLibraryAPI() {
  return useLibraryStore((state) => state.api);
}
