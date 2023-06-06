import type electron from 'electron';
import { ipcRenderer } from 'electron';
import { chunk, flatten } from 'lodash-es';

import store from '../store';
import types from '../action-types';
import { TrackEditableFields, SortBy, TrackModel, Track } from '../../../shared/types/museeks';
import channels from '../../../shared/lib/ipc-channels';
import logger from '../../../shared/lib/logger';
import { getLoweredMeta } from '../../../shared/lib/utils-id3';
import useToastsStore from '../../stores/useToastsStore';
import router from '../../views/router';

import * as PlaylistsActions from './PlaylistsActions';

const { path, db } = window.MuseeksAPI;

/**
 * Filter tracks by search
 */
export const search = (value: string): void => {
  store.dispatch({
    type: types.FILTER_SEARCH,
    payload: {
      search: value,
    },
  });
};

/**
 * Filter tracks by sort query
 */
export const sort = (sortBy: SortBy): void => {
  store.dispatch({
    type: types.LIBRARY_SORT,
    payload: {
      sortBy,
    },
  });
};

const scanPlaylists = async (paths: string[]) => {
  return Promise.all(
    paths.map(async (filePath) => {
      try {
        const playlistFiles = await window.MuseeksAPI.playlists.resolveM3u(filePath);
        const playlistName = path.parse(filePath).name;

        const existingTracks: TrackModel[] = await db.tracks.findByPath(playlistFiles);

        await PlaylistsActions.create(
          playlistName,
          existingTracks.map((track) => track._id),
          filePath
        );
      } catch (err) {
        logger.warn(err);
      }
    })
  );
};

/**
 * Add tracks to Library
 */
export const add = async (pathsToScan: string[]): Promise<TrackModel[]> => {
  store.dispatch({
    type: types.LIBRARY_REFRESH_START,
  });

  try {
    // Get all valid track paths
    // TODO move this whole function to main process
    const [supportedTrackFiles, supportedPlaylistsFiles] = await ipcRenderer.invoke(
      channels.LIBRARY_SCAN_TRACKS,
      pathsToScan
    );

    if (supportedTrackFiles.length === 0 && supportedPlaylistsFiles.length === 0) {
      store.dispatch({
        type: types.LIBRARY_REFRESH_END,
      });

      return [];
    }

    // 5. Import the music tracks found the directories
    const tracks: Track[] = await ipcRenderer.invoke(channels.LIBRARY_IMPORT_TRACKS, supportedTrackFiles);

    const batchSize = 100;
    const chunkedTracks = chunk(tracks, batchSize);
    let processed = 0;

    const chunkedImportedTracks = await Promise.all(
      chunkedTracks.map(async (chunk) => {
        // First, let's see if some of those files are already inserted
        const insertedChunk = await db.tracks.insertMultiple(chunk);

        processed += batchSize;

        // Progress bar update
        store.dispatch({
          type: types.LIBRARY_REFRESH_PROGRESS,
          payload: {
            processed,
            total: tracks.length,
          },
        });

        return insertedChunk;
      })
    );

    const importedTracks = flatten(chunkedImportedTracks);

    // TODO: do not re-import existing tracks

    // Import playlists found in the directories
    await scanPlaylists(supportedPlaylistsFiles);

    router.revalidate();

    return importedTracks;
  } catch (err) {
    useToastsStore.getState().api.add('danger', 'An error occured when scanning the library');
    logger.warn(err);
    return [];
  } finally {
    store.dispatch({
      type: types.LIBRARY_REFRESH_END,
    });
  }
};

/**
 * remove tracks from library
 */
export const remove = async (tracksIds: string[]): Promise<void> => {
  // not calling await on it as it calls the synchonous message box
  const options: Electron.MessageBoxOptions = {
    buttons: ['Cancel', 'Remove'],
    title: 'Remove tracks from library?',
    message: `Are you sure you want to remove ${tracksIds.length} element(s) from your library?`,
    type: 'warning',
  };

  const result: electron.MessageBoxReturnValue = await ipcRenderer.invoke(channels.DIALOG_MESSAGE_BOX, options);

  if (result.response === 1) {
    // button possition, here 'remove'
    // Remove tracks from the Track collection
    await db.tracks.remove(tracksIds);

    router.revalidate();
    // That would be great to remove those ids from all the playlists, but it's not easy
    // and should not cause strange behaviors, all PR for that would be really appreciated
    // TODO: see if it's possible to remove the Ids from the selected state of TracksList as it "could" lead to strange behaviors
  }
};

/**
 * Reset the library
 */
export const reset = async (): Promise<void> => {
  try {
    const options: Electron.MessageBoxOptions = {
      buttons: ['Cancel', 'Reset'],
      title: 'Reset library?',
      message: 'Are you sure you want to reset your library? All your tracks and playlists will be cleared.',
      type: 'warning',
    };

    const result = await ipcRenderer.invoke(channels.DIALOG_MESSAGE_BOX, options);

    if (result.response === 1) {
      store.dispatch({
        type: types.LIBRARY_REFRESH_START,
      });

      await db.reset();

      store.dispatch({
        type: types.LIBRARY_RESET,
      });

      store.dispatch({
        type: types.LIBRARY_REFRESH_END,
      });

      router.revalidate();
    }
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Update the play count attribute.
 */
export const incrementPlayCount = async (trackID: string): Promise<void> => {
  try {
    await db.tracks.updateWithRawQuery(trackID, { $inc: { playcount: 1 } });
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Update the id3 attributes.
 * IMPROVE ME: add support for writing metadata (hint: node-id3 does not work
 * well).
 *
 * @param trackId The ID of the track to update
 * @param newFields The fields to be updated and their new value
 */
export const updateTrackMetadata = async (trackId: string, newFields: TrackEditableFields): Promise<void> => {
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
};

/**
 * Set highlight trigger for a track
 */
export const highlightPlayingTrack = (highlight: boolean): void => {
  store.dispatch({
    type: types.LIBRARY_HIGHLIGHT_PLAYING_TRACK,
    payload: {
      highlight,
    },
  });
};
