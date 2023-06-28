import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import type { MessageBoxReturnValue } from 'electron';

import {
  LibrarySort,
  SortBy,
  SortOrder,
  Track,
  TrackEditableFields,
  TrackModel,
} from '../../shared/types/museeks';
import logger from '../../shared/lib/logger';
import router from '../views/router';
import channels from '../../shared/lib/ipc-channels';
import { getLoweredMeta, stripAccents } from '../../shared/lib/utils-id3';

import PlaylistsAPI from './PlaylistsAPI';
import { createStore } from './store-helpers';
import useToastsStore from './useToastsStore';
import usePlayerStore from './usePlayerStore';

const { path, db, config } = window.MuseeksAPI;
const { ipcRenderer } = window.ElectronAPI;

type LibraryState = {
  search: string;
  sort: LibrarySort;
  refreshing: boolean;
  refresh: {
    processed: number;
    total: number;
  };
  highlightPlayingTrack: boolean;
  api: {
    search: (value: string) => void;
    sort: (sortBy: SortBy) => void;
    scanPlaylists: (paths: string[]) => Promise<void>;
    add: (pathsToScan: string[]) => Promise<TrackModel[]>;
    remove: (tracksIds: string[]) => Promise<void>;
    reset: () => Promise<void>;
    incrementPlayCount: (trackID: string) => Promise<void>;
    updateTrackMetadata: (
      trackId: string,
      newFields: TrackEditableFields,
    ) => Promise<void>;
    highlightPlayingTrack: (highlight: boolean) => void;
  };
};

const useLibraryStore = createStore<LibraryState>((set, get) => ({
  search: '',
  sort: config.__initialConfig['librarySort'],
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
      set({ search: stripAccents(search) });
    },

    /**
     * Filter tracks by sort query
     */
    sort: async (sortBy): Promise<void> => {
      const prevSort = get().sort;

      let sort: LibrarySort | null = null;

      // If same sort by, just reverse the order
      if (sortBy === prevSort.by) {
        sort = {
          ...prevSort,
          order:
            prevSort.order === SortOrder.ASC ? SortOrder.DSC : SortOrder.ASC,
        };
      }
      // If it's different, then we assume the user needs ASC order by default
      else {
        sort = {
          by: sortBy,
          order: SortOrder.ASC,
        };
      }

      await config.set('librarySort', sort);

      set({ sort });
    },

    /**
     * Scan a directory for playlists and import them
     * TODO: probaly move to "main"?
     */
    scanPlaylists: async (paths) => {
      await Promise.all(
        paths.map(async (filePath) => {
          try {
            const playlistFiles = await window.MuseeksAPI.playlists.resolveM3u(
              filePath,
            );
            const playlistName = path.parse(filePath).name;

            const existingTracks: TrackModel[] = await db.tracks.findByPath(
              playlistFiles,
            );

            await PlaylistsAPI.create(
              playlistName,
              existingTracks.map((track) => track._id),
              filePath,
            );
          } catch (err) {
            logger.warn(err);
          }
        }),
      );
    },

    /**
     * Add tracks to Library
     */
    add: async (pathsToScan): Promise<TrackModel[]> => {
      set({ refreshing: true });

      try {
        // Get all valid track paths
        // TODO move this whole function to main process
        const [supportedTrackFiles, supportedPlaylistsFiles] =
          await ipcRenderer.invoke(channels.LIBRARY_SCAN_TRACKS, pathsToScan);

        if (
          supportedTrackFiles.length === 0 &&
          supportedPlaylistsFiles.length === 0
        ) {
          set({
            refreshing: false,
            refresh: { processed: 0, total: 0 },
          });
          return [];
        }

        // 5. Import the music tracks found the directories
        const tracks: Track[] = await ipcRenderer.invoke(
          channels.LIBRARY_IMPORT_TRACKS,
          supportedTrackFiles,
        );

        const batchSize = 100;
        const chunkedTracks = chunk(tracks, batchSize);
        let processed = 0;

        const chunkedImportedTracks = await Promise.all(
          chunkedTracks.map(async (chunk) => {
            // First, let's see if some of those files are already inserted
            const insertedChunk = await db.tracks.insertMultiple(chunk);

            processed += batchSize;

            // Progress bar update
            set({
              refresh: {
                processed,
                total: tracks.length,
              },
            });

            return insertedChunk;
          }),
        );

        const importedTracks = flatten(chunkedImportedTracks);

        // TODO: do not re-import existing tracks

        // Import playlists found in the directories
        await get().api.scanPlaylists(supportedPlaylistsFiles);

        router.revalidate();

        return importedTracks;
      } catch (err) {
        useToastsStore
          .getState()
          .api.add('danger', 'An error occured when scanning the library');
        logger.warn(err);
        return [];
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
    remove: async (tracksIds) => {
      // not calling await on it as it calls the synchonous message box
      const options: Electron.MessageBoxOptions = {
        buttons: ['Cancel', 'Remove'],
        title: 'Remove tracks from library?',
        message: `Are you sure you want to remove ${tracksIds.length} element(s) from your library?`,
        type: 'warning',
      };

      const result: MessageBoxReturnValue = await ipcRenderer.invoke(
        channels.DIALOG_MESSAGE_BOX,
        options,
      );

      if (result.response === 1) {
        // button possition, here 'remove'
        // Remove tracks from the Track collection
        await db.tracks.remove(tracksIds);

        router.revalidate();
        // That would be great to remove those ids from all the playlists, but it's not easy
        // and should not cause strange behaviors, all PR for that would be really appreciated
        // TODO: see if it's possible to remove the Ids from the selected state of TracksList as it "could" lead to strange behaviors
      }
    },

    /**
     * Reset the library
     */
    reset: async (): Promise<void> => {
      usePlayerStore.getState().api.stop();
      try {
        const options: Electron.MessageBoxOptions = {
          buttons: ['Cancel', 'Reset'],
          title: 'Reset library?',
          message:
            'Are you sure you want to reset your library? All your tracks and playlists will be cleared.',
          type: 'warning',
        };

        const result = await ipcRenderer.invoke(
          channels.DIALOG_MESSAGE_BOX,
          options,
        );

        if (result.response === 1) {
          set({ refreshing: true });
          await db.reset();
          set({ refreshing: false });

          router.revalidate();
        }
      } catch (err) {
        logger.error(err);
      }
    },

    /**
     * Update the play count attribute.
     */
    incrementPlayCount: async (trackID: string): Promise<void> => {
      try {
        await db.tracks.updateWithRawQuery(trackID, { $inc: { playcount: 1 } });
      } catch (err) {
        logger.warn(err);
      }
    },

    /**
     * Update the id3 attributes.
     * IMPROVE ME: add support for writing metadata (hint: node-id3 does not work
     * well).
     *
     * @param trackId The ID of the track to update
     * @param newFields The fields to be updated and their new value
     */
    updateTrackMetadata: async (
      trackId: string,
      newFields: TrackEditableFields,
    ): Promise<void> => {
      let track = await db.tracks.findOnlyByID(trackId);

      track = {
        ...track,
        ...newFields,
        loweredMetas: getLoweredMeta(newFields),
      };

      if (!track) {
        throw new Error('No track found while trying to update track metadata');
      }

      await db.tracks.update(trackId, track);

      router.revalidate();
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
