import { ask, open } from '@tauri-apps/plugin-dialog';

import type { SortBy, SortOrder, Track } from '../generated/typings';
import config from '../lib/config';
import database from '../lib/database';
import { logAndNotifyError } from '../lib/utils';

import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStatus, removeRedundantFolders } from '../lib/utils-library';
import type { API, TrackMutation } from '../types/syncudio';
import { createStore } from './store-helpers';
import usePlayerStore from './usePlayerStore';
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
  tracksStatus: string;
  api: {
    search: (value: string) => void;
    sort: (sortBy: SortBy) => void;
    add: () => Promise<void>;
    addLibraryFolders: (paths: Array<string>) => Promise<void>;
    removeLibraryFolder: (path: string) => Promise<void>;
    refresh: () => Promise<void>;
    remove: (tracksIDs: string[]) => Promise<void>;
    reset: () => Promise<void>;
    setRefresh: (processed: number, total: number) => void;
    updateTrackMetadata: (
      trackID: string,
      fields: TrackMutation,
    ) => Promise<void>;
    setTracksStatus: (status: Array<Track> | null) => void;
  };
}>;

const useLibraryStore = createLibraryStore<LibraryState>((set, get) => ({
  search: '',
  sortBy: config.getInitial('library_sort_by'),
  sortOrder: config.getInitial('library_sort_order'),
  refreshing: false,
  refresh: {
    current: 0,
    total: 0,
  },
  tracksStatus: '',

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

      await config.set('library_sort_by', sortBy);
      await config.set('library_sort_order', sortOrder);

      set({ sortBy, sortOrder });
    },

    /**
     * Add tracks to Library
     */
    add: async () => {
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
      } catch (err) {
        logAndNotifyError(err);
      } finally {
        set({
          refreshing: false,
          refresh: { current: 0, total: 0 },
        });
      }
    },

    refresh: async () => {
      try {
        set({ refreshing: true });

        const libraryFolders = await config.get('library_folders');
        const scanResult = await database.importTracks(libraryFolders);

        if (scanResult.track_count > 0) {
          useToastsStore
            .getState()
            .api.add(
              'success',
              `${scanResult.track_count} track(s) were added to the library.`,
              5000,
            );
        }

        if (scanResult.playlist_count > 0) {
          useToastsStore
            .getState()
            .api.add(
              'success',
              `${scanResult.playlist_count} playlist(s) were added to the library.`,
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
        const musicFolders = await config.get('library_folders');
        const newFolders = removeRedundantFolders([
          ...musicFolders,
          ...paths,
        ]).sort();
        await config.set('library_folders', newFolders);
      } catch (err) {
        logAndNotifyError(err);
      }
    },

    removeLibraryFolder: async (path) => {
      const musicFolders = await config.get('library_folders');
      const index = musicFolders.indexOf(path);
      musicFolders.splice(index, 1);
      await config.set('library_folders', musicFolders);
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

        // That would be great to remove those ids from all the playlists, but it's not easy
        // and should not cause strange behaviors, all PR for that would be really appreciated
        // TODO: see if it's possible to remove the IDs from the selected state of TracksList as it "could" lead to strange behaviors
      }
    },

    /**
     * Reset the library
     */
    reset: async () => {
      usePlayerStore.getState().api.stop();
      try {
        const confirmed = await ask(
          'All your tracks and playlists will be deleted from Syncudio.',
          {
            title: 'Reset library?',
            kind: 'warning',
            cancelLabel: 'Cancel',
            okLabel: 'Reset',
          },
        );

        if (confirmed) {
          await database.reset();
          await config.set('library_folders', []);
          useToastsStore.getState().api.add('success', 'Library was reset');
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
    updateTrackMetadata: async (trackID, newFields) => {
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
    setTracksStatus: async (tracks) => {
      set({
        tracksStatus: tracks !== null ? getStatus(tracks) : '',
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
      name: 'syncudio-library',
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
