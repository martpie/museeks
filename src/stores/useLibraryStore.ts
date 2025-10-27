import { t } from '@lingui/core/macro';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SortBy, SortOrder } from '../generated/typings';
import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
import player from '../lib/player';
import { logAndNotifyError } from '../lib/utils';
import { removeRedundantFolders } from '../lib/utils-library';
import type { API, TrackListStatusInfo, TrackMutation } from '../types/museeks';
import { createStore } from './store-helpers';
import useToastsStore from './useToastsStore';

type LibraryState = API<{
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  refreshing: boolean;
  refresh: {
    current: number;
    total: number;
  };
  tracksStatus: TrackListStatusInfo | null;
  api: {
    search: (value: string) => void;
    sort: (sortBy: SortBy) => void;
    addLibraryFolders: (paths: Array<string>) => Promise<void>;
    removeLibraryFolder: (path: string) => Promise<void>;
    scan: (refresh?: boolean) => Promise<void>;
    remove: (tracksIDs: string[]) => Promise<void>;
    reset: () => Promise<void>;
    setRefresh: (processed: number, total: number) => void;
    updateTrackMetadata: (
      trackID: string,
      fields: TrackMutation,
    ) => Promise<void>;
    setTracksStatus: (status?: TrackListStatusInfo) => void;
  };
}>;

const useLibraryStore = createLibraryStore<LibraryState>((set, get) => ({
  search: '',
  sortBy: ConfigBridge.getInitial('library_sort_by'),
  sortOrder: ConfigBridge.getInitial('library_sort_order'),
  refreshing: false,
  refresh: {
    current: 0,
    total: 0,
  },
  tracksStatus: null,

  api: {
    /**
     * Filter tracks by search
     */
    search: async (search) => {
      set({ search });
    },

    /**
     * Filter tracks by sort query
     */
    sort: async (sortBy) => {
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

      await ConfigBridge.set('library_sort_by', sortBy);
      await ConfigBridge.set('library_sort_order', sortOrder);

      set({ sortBy, sortOrder });
    },

    scan: async (
      // Force a refresh of the ID3 tags stored in the DB
      refresh = false,
    ) => {
      try {
        set({ refreshing: true });

        const libraryFolders = await ConfigBridge.get('library_folders');
        const scanResult = await DatabaseBridge.importTracks(
          libraryFolders,
          refresh,
        );

        if (scanResult.track_count > 0) {
          const message = refresh
            ? t`${scanResult.track_count} track(s) were refreshed.`
            : t`${scanResult.track_count} track(s) were added to the library.`;

          useToastsStore.getState().api.add('success', message, 5000);
        }

        if (scanResult.playlist_count > 0) {
          useToastsStore
            .getState()
            .api.add(
              'success',
              t`${scanResult.playlist_count} playlist(s) were added to the library.`,
              5000,
            );
        }
      } catch (err) {
        logAndNotifyError(err);
      } finally {
        set({
          refreshing: false,
          refresh: { current: 0, total: 0 },
        });
      }
    },

    addLibraryFolders: async (paths: Array<string>) => {
      try {
        const musicFolders = await ConfigBridge.get('library_folders');
        const newFolders = removeRedundantFolders([
          ...musicFolders,
          ...paths,
        ]).sort();
        await ConfigBridge.set('library_folders', newFolders);
      } catch (err) {
        logAndNotifyError(err);
      }
    },

    removeLibraryFolder: async (path) => {
      const musicFolders = await ConfigBridge.get('library_folders');
      const index = musicFolders.indexOf(path);
      musicFolders.splice(index, 1);
      await ConfigBridge.set('library_folders', musicFolders);
    },

    setRefresh: async (current, total) => {
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
      await DatabaseBridge.removeTracks(tracksIDs);
      // That would be great to remove those ids from all the playlists, but it's not easy
      // and should not cause strange behaviors, all PR for that would be really appreciated
      // TODO: see if it's possible to remove the IDs from the selected state of TrackList as it "could" lead to strange behaviors
    },

    /**
     * Reset the library
     */
    reset: async () => {
      player.stop();
      try {
        await DatabaseBridge.reset();
        await ConfigBridge.set('library_folders', []);
        useToastsStore.getState().api.add('success', t`Library was reset`);
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
    updateTrackMetadata: async (trackID, newFields) => {
      try {
        let [track] = await DatabaseBridge.getTracks([trackID]);

        if (!track) {
          throw new Error(
            'No track found while trying to update track metadata',
          );
        }

        track = {
          ...track,
          ...newFields,
        };

        await DatabaseBridge.updateTrack(track);
      } catch (err) {
        logAndNotifyError(
          err,
          'Something wrong happened when updating the track',
        );
      }
    },

    /**
     * Manually set the footer content based on a list of tracks
     */
    setTracksStatus: async (status) => {
      set({
        tracksStatus: status,
      });
    },
  },
}));

export default useLibraryStore;

export function useLibraryAPI() {
  return useLibraryStore((state) => state.api);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Special store for player
 */
function createLibraryStore<T extends LibraryState>(store: StateCreator<T>) {
  return createStore(
    persist(store, {
      name: 'museeks-library',
      merge(persistedState, currentState) {
        const mergedState = {
          ...currentState,
          // API should never be persisted
          api: currentState.api,
        };

        if (persistedState != null && typeof persistedState === 'object') {
          if ('refreshing' in persistedState) {
            persistedState.refreshing = false;
          }
          if ('refresh' in persistedState) {
            persistedState.refresh = {
              current: 0,
              total: 0,
            };
          }
        }

        return mergedState;
      },
    }),
  );
}
