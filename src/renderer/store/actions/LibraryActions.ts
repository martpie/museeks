import * as fs from 'fs';
import path from 'path';
import electron, { ipcRenderer } from 'electron';
import queue from 'queue';

import store from '../store';
import types from '../action-types';

import * as app from '../../lib/app';
import * as utils from '../../lib/utils';
import * as m3u from '../../lib/utils-m3u';
import { TrackEditableFields, SortBy, TrackModel } from '../../../shared/types/museeks';
import channels from '../../../shared/lib/ipc-channels';

import logger from '../../../shared/lib/logger';
import * as PlaylistsActions from './PlaylistsActions';
import * as ToastsActions from './ToastsActions';

/**
 * Load tracks from database
 */
export const refresh = async (): Promise<void> => {
  try {
    const tracks = await app.db.Track.find().execAsync();

    store.dispatch({
      type: types.LIBRARY_REFRESH,
      payload: {
        tracks,
      },
    });
  } catch (err) {
    logger.warn(err);
  }
};

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
        const playlistFiles = m3u.parse(filePath);
        const playlistName = path.parse(filePath).name;

        const existingTracks: TrackModel[] = await app.db.Track.findAsync({
          $or: playlistFiles.map((filePath) => ({ path: filePath })),
        });

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

const scan = {
  processed: 0,
  total: 0,
};

const scanTracks = async (paths: string[]): Promise<TrackModel[]> => {
  return new Promise((resolve, reject) => {
    if (paths.length === 0) resolve([]);

    try {
      // Instantiate queue
      let scannedFiles: TrackModel[] = [];

      // eslint-disable-next-line
      // @ts-ignore Outdated types
      // https://github.com/jessetane/queue/pull/15#issuecomment-414091539
      const scanQueue = queue();
      scanQueue.concurrency = 32;
      scanQueue.autostart = true;

      scanQueue.on('end', async () => {
        scan.processed = 0;
        scan.total = 0;

        resolve(scannedFiles);
      });

      scanQueue.on('success', () => {
        // Every 100 scans, update progress bar
        if (scan.processed % 100 === 0) {
          // Progress bar update
          store.dispatch({
            type: types.LIBRARY_REFRESH_PROGRESS,
            payload: {
              processed: scan.processed,
              total: scan.total,
            },
          });

          // Add tracks to the library view
          const tracks = [...scannedFiles];
          scannedFiles = []; // Reset current selection
          store.dispatch({
            type: types.LIBRARY_ADD_TRACKS,
            payload: {
              tracks,
            },
          });
        }
      });
      // End queue instantiation

      scan.total += paths.length;

      paths.forEach((filePath) => {
        scanQueue.push(async (callback) => {
          try {
            // Normalize (back)slashes on Windows
            filePath = path.resolve(filePath);

            // Check if there is an existing record in the DB
            const existingDoc = await app.db.Track.findOneAsync({ path: filePath });

            // If there is existing document
            if (!existingDoc) {
              // Get metadata
              const track = await utils.getMetadata(filePath);
              const insertedDoc: TrackModel = await app.db.Track.insertAsync(track);
              scannedFiles.push(insertedDoc);
            }

            scan.processed++;
          } catch (err) {
            logger.warn(err);
          }

          if (callback) callback();
        });
      });
    } catch (err) {
      reject(err);
    }
  });
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

    // 5. Scan tracks then scan playlists
    const importedTracks = await scanTracks(supportedTrackFiles);
    await scanPlaylists(supportedPlaylistsFiles);

    await refresh();
    await PlaylistsActions.refresh();

    return importedTracks;
  } catch (err) {
    ToastsActions.add('danger', 'An error occured when scanning the library');
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
    app.db.Track.removeAsync({ _id: { $in: tracksIds } }, { multi: true });

    store.dispatch({
      type: types.LIBRARY_REMOVE_TRACKS,
      payload: {
        tracksIds,
      },
    });
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

      await app.db.Track.removeAsync({}, { multi: true });
      await app.db.Playlist.removeAsync({}, { multi: true });

      store.dispatch({
        type: types.LIBRARY_RESET,
      });

      store.dispatch({
        type: types.LIBRARY_REFRESH_END,
      });

      await refresh();
    }
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Update the play count attribute.
 */
export const incrementPlayCount = async (source: string): Promise<void> => {
  const query = { src: source }; // HACK Not great, should be done with an _id
  const update = { $inc: { playcount: 1 } };
  try {
    await app.db.Track.updateAsync(query, update);
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
  const query = { _id: trackId };

  let track: TrackModel = await app.db.Track.findOneAsync(query);

  track = {
    ...track,
    ...newFields,
    loweredMetas: utils.getLoweredMeta(newFields),
  };

  if (!track) {
    throw new Error('No track found while trying to update track metadata');
  }

  await app.db.Track.updateAsync(query, track);

  await refresh();
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
