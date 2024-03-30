import { ask, open } from '@tauri-apps/plugin-dialog';

import { SortBy, SortOrder, Track } from '../generated/typings';
import config from '../lib/config';
import database from '../lib/database';
import { logAndNotifyError } from '../lib/utils';
import { invalidate } from '../lib/query';

import { createStore } from './store-helpers';
import usePlayerStore from './usePlayerStore';
import useToastsStore from './useToastsStore';

type LibraryState = {
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  refreshing: boolean;
  refresh: {
    current: number;
    total: number;
  };
  highlightPlayingTrack: boolean;
  api: {
    search: (value: string) => void;
    sort: (sortBy: SortBy) => void;
    add: () => Promise<void>;
    remove: (tracksIDs: string[]) => Promise<void>;
    reset: () => Promise<void>;
    setRefresh: (processed: number, total: number) => void;
    updateTrackMetadata: (
      trackID: string,
      fields: Pick<Track, 'title' | 'artists' | 'album' | 'genres'>,
    ) => Promise<void>;
    highlightPlayingTrack: (highlight: boolean) => void;
  };
};

const useLibraryStore = createStore<LibraryState>((set, get) => ({
  search: '',
  sortBy: config.getInitial('library_sort_by'),
  sortOrder: config.getInitial('library_sort_order'),
  refreshing: false,
  refresh: {
    current: 0,
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
        await database.importTracks(result);
        // TODO: re-implement progress
        invalidate();
        return;
      } catch (err) {
        logAndNotifyError(err);
      } finally {
        set({
          refreshing: false,
          refresh: { current: 0, total: 0 },
        });
      }
    },

    setRefresh: (current: number, total: number) => {
      set({
        refresh: {
          current,
          total,
        },
      });
    },

    /**
     * remove tracks from library
     */
    remove: async (tracksIDs) => {
      const confirmed = await ask(
        `Are you sure you want to remove ${tracksIDs.length} element(s) from your library?`,
        {
          title: 'Remove tracks from library?',
          kind: 'warning',
          cancelLabel: 'Cancel',
          okLabel: 'Remove',
        },
      );

      if (confirmed) {
        // button possition, here 'remove'
        // Remove tracks from the Track collection
        await database.removeTracks(tracksIDs);

        invalidate();
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
          {
            title: 'Reset library?',
            kind: 'warning',
            cancelLabel: 'Cancel',
            okLabel: 'Reset',
          },
        );

        if (confirmed) {
          await database.reset();
          useToastsStore.getState().api.add('success', 'Library was reset');
          invalidate();
        }
      } catch (err) {
        logAndNotifyError(err);
      }
    },

    /**
     * Update the id3 attributes.
     * IMPROVE ME: add support for writing metadata to disk (and not only update
     * the DB).
     *
     * @param trackID The ID of the track to update
     * @param newFields The fields to be updated and their new value
     */
    updateTrackMetadata: async (
      trackID: string,
      newFields: Pick<Track, 'title' | 'artists' | 'album' | 'genres'>,
    ): Promise<void> => {
      try {
        let [track] = await database.getTracks([trackID]);

        if (!track) {
          throw new Error(
            'No track found while trying to update track metadata',
          );
        }

        track = {
          ...track,
          ...newFields,
        };

        await database.updateTrack(track);

        invalidate();
      } catch (err) {
        logAndNotifyError(
          err,
          'Something wrong happened when updating the track',
        );
      }
    },

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
