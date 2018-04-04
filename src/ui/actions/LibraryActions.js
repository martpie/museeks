import electron from 'electron';
import fs from 'fs';
import path from 'path';
import util from 'util';
import globby from 'globby';
import queue from 'queue';

import store from '../store.js';

import types from '../constants/action-types';
import * as LibraryActions from './LibraryActions';

import * as app from '../lib/app';
import * as utils from '../utils/utils';


const dialog = electron.remote.dialog;
const stat = util.promisify(fs.stat);

/**
 * Load tracks from database
 * @return {Promise} [description]
 */
export const load = async () => {
  try {
    const tracks = await app.models.Track.find().execAsync();

    store.dispatch({
      type: types.APP_LIBRARY_REFRESH,
      tracks,
    });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Filter tracks by search
 * @param {String} search
 */
export const search = (search) => {
  store.dispatch({
    type: types.APP_FILTER_SEARCH,
    search,
  });
};

/**
 * Filter tracks by sort query
 * @param {String} sortBy [description]
 */
export const sort = (sortBy) => {
  store.dispatch({
    type: types.APP_LIBRARY_SORT,
    sortBy,
  });
};

/**
 * Add tracks to Library
 * @param {String[]} pathsToScan [description]
 */
export const add = (pathsToScan) => {
  // Instantiate queue
  const scan = {
    processed: 0,
    total: 0,
  };

  const endScan = () => {
    scan.processed = 0;
    scan.total = 0;

    store.dispatch({
      type: types.APP_LIBRARY_REFRESH_END,
    });

    LibraryActions.load();
  };

  const scanQueue = new queue();
  scanQueue.concurrency = 16;
  scanQueue.autostart = true;

  scanQueue.on('end', endScan);
  scanQueue.on('success', () => {
    store.dispatch({
      type: types.APP_LIBRARY_REFRESH_PROGRESS,
      processed: scan.processed,
      total: scan.total,
    });
  });
  // End queue instantiation

  store.dispatch({
    type: types.APP_LIBRARY_REFRESH_START,
  });

  let rootFiles; // HACK Kind of hack, looking for a better solution

  // Scan folders and add files to library
  new Promise((resolve) => {
    const promises = pathsToScan.map(async (path) => {
      return {
        path,
        stat: await stat(path),
      };
    });

    const paths = Promise.all(promises);

    resolve(paths);
  }).then((paths) => {
    const files = [];
    const folders = [];

    paths.forEach((elem) => {
      if (elem.stat.isFile()) files.push(elem.path);
      if (elem.stat.isDirectory() || elem.stat.isSymbolicLink()) folders.push(elem.path);
    });

    rootFiles = files;

    const globbies = folders.map((folder) => {
      const pattern = path.join(folder, '**/*.*');
      return globby(pattern, { follow: true });
    });

    return Promise.all(globbies);
  }).then((files) => {
    // Merge all path arrays together and filter them with the extensions we support
    const flatFiles = files.reduce((acc, array) => acc.concat(array), [])
      .concat(rootFiles)
      .filter((filePath) => {
        const extension = path.extname(filePath).toLowerCase();
        return app.supportedExtensions.includes(extension);
      });

    return flatFiles;
  }).then((supportedFiles) => {
    if (supportedFiles.length === 0) {
      return;
    }

    // Add files to be processed to the scan object
    scan.total += supportedFiles.length;

    supportedFiles.forEach((filePath) => {
      scanQueue.push((callback) => {
        return app.models.Track.findAsync({ path: filePath }).then((docs) => {
          if (docs.length === 0) {
            return utils.getMetadata(filePath);
          }
          return null;
        }).then((track) => {
          // If null, that means a track with the same absolute path already exists in the database
          if (track === null) return;
          // else, insert the new document in the database
          return app.models.Track.insertAsync(track);
        }).then(() => {
          scan.processed++;
          callback();
          return null;
        });
      });
    });

    return null;
  }).catch((err) => {
    console.warn(err);
  });

  // TODO progressive loading in the store, don't freeze the app, able to add files/folders when scanning
};

/**
 * remove tracks from library
 * @param {String[]} tracksIds the ids of tracks to be removed
 */
export const remove = (tracksIds) => {
  // not calling await on it as it calls the synchonous message box
  dialog.showMessageBox(app.browserWindows.main, {
    buttons: [
      'Cancel',
      'Remove',
    ],
    title: 'Remove tracks from library?',
    message: `Are you sure you want to remove ${tracksIds.length} element(s) from your library?`,
    type: 'warning',
  }, (result) => {
    if (result === 1) { // button possition, here 'remove'
      // Remove tracks from the Track collection
      app.models.Track.removeAsync({ _id: { $in: tracksIds } }, { multi: true });

      store.dispatch({
        type: types.APP_LIBRARY_REMOVE_TRACKS,
        tracksIds,
      });
      // That would be great to remove those ids from all the playlists, but it's not easy
      // and should not cause strange behaviors, all PR for that would be really appreciated
      // TODO: see if it's possible to remove the Ids from the selected state of TracksList as it "could" lead to strange behaviors
    }
  });
};

/**
 * Reset the library
 * @return {Promise} [description]
 */
export const reset = async () => {
  try {
    const result = await dialog.showMessageBox(app.browserWindows.main, {
      buttons: [
        'Cancel',
        'Reset',
      ],
      title: 'Reset library?',
      message: 'Are you sure you want to reset your library ? All your tracks and playlists will be cleared.',
      type: 'warning',
    });

    if (result === 1) {
      store.dispatch({
        type: types.APP_LIBRARY_REFRESH_START,
      });

      await app.models.Track.removeAsync({}, { multi: true });
      await app.models.Playlist.removeAsync({}, { multi: true });


      store.dispatch({
        type: types.APP_LIBRARY_RESET,
      });

      store.dispatch({
        type: types.APP_LIBRARY_REFRESH_END,
      });

      load();
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Update the play count attribute.
 * @param source
 */
export const incrementPlayCount = async (source) => {
  const query = { src: source }; // Not great, should be done with an _id
  const update = { $inc: { playcount: 1 } };
  try {
    await app.models.Track.updateAsync(query, update);
  } catch (err) {
    console.warn(err);
  }
};
