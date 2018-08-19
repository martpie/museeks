import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as globby from 'globby';
import * as queue from 'queue';

import store from '../store';

import types from '../constants/action-types';
import * as LibraryActions from './LibraryActions';

import * as app from '../lib/app';
import * as utils from '../utils/utils';
import { SortBy } from '../types/interfaces';

const { dialog } = electron.remote;
const stat = util.promisify(fs.stat);

interface ScanFile {
  path: string;
  stat: fs.Stats;
}

/**
 * Load tracks from database
 */
export const load = async () => {
  try {
    const tracks = await app.models.Track.find().execAsync();

    store.dispatch({
      type: types.APP_LIBRARY_REFRESH,
      payload: {
        tracks
      }
    });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Filter tracks by search
 */
export const search = (value: string) => {
  store.dispatch({
    type: types.APP_FILTER_SEARCH,
    payload: {
      search: value
    }
  });
};

/**
 * Filter tracks by sort query
 */
export const sort = (sortBy: SortBy) => {
  store.dispatch({
    type: types.APP_LIBRARY_SORT,
    payload: {
      sortBy
    }
  });
};

/**
 * Add tracks to Library
 */
export const add = (pathsToScan: string[]) => {
  // Instantiate queue
  const scan = {
    processed: 0,
    total: 0
  };

  const endScan = async () => {
    scan.processed = 0;
    scan.total = 0;

    store.dispatch({
      type: types.APP_LIBRARY_REFRESH_END
    });

    await LibraryActions.load();
  };

  // @ts-ignore Outdated types
  // https://github.com/jessetane/queue/pull/15#issuecomment-414091539
  const scanQueue = queue();
  scanQueue.concurrency = 32;
  scanQueue.autostart = true;

  scanQueue.on('end', endScan);
  scanQueue.on('success', () => {
    // Every 10 scans, update progress bar
    if (scan.processed % 10 === 0) {
      store.dispatch({
        type: types.APP_LIBRARY_REFRESH_PROGRESS,
        payload: {
          processed: scan.processed,
          total: scan.total
        }
      });
    }
  });
  // End queue instantiation

  store.dispatch({
    type: types.APP_LIBRARY_REFRESH_START
  });

  let rootFiles: string[]; // HACK Kind of hack, looking for a better solution

  // Scan folders and add files to library
  new Promise<ScanFile[]>((resolve) => {
    const promises = pathsToScan.map(async folderPath => ({
      path: folderPath,
      stat: await stat(folderPath)
    }));

    const paths = Promise.all(promises);

    resolve(paths);
  }).then((paths) => {
    const files: string[] = [];
    const folders: string[] = [];

    paths.forEach((elem) => {
      if (elem.stat.isFile()) files.push(elem.path);
      if (elem.stat.isDirectory() || elem.stat.isSymbolicLink()) folders.push(elem.path);
    });

    rootFiles = files;

    const globbies = folders.map((folder) => {
      const pattern = path.join(folder, '**/*.*');
      return globby(pattern, { followSymlinkedDirectories: true });
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
      scanQueue.push(async (callback: Function) => {
        // Check if there is an existing record in the DB
        const existingDoc = await app.models.Track.findOneAsync({ path: filePath });

        // If there is existing document
        if (!existingDoc) {
          // Get metadata
          const track = await utils.getMetadata(filePath);
          await app.models.Track.insertAsync(track);
        }

        scan.processed++;
        callback();
      });
    });
  })
    .catch((err) => {
      console.warn(err);
    });

  // TODO progressive loading in the store, don't freeze the app, able to add files/folders when scanning
};

/**
 * remove tracks from library
 */
export const remove = (tracksIds: string[]) => {
  // not calling await on it as it calls the synchonous message box
  dialog.showMessageBox(app.browserWindows.main, {
    buttons: [
      'Cancel',
      'Remove'
    ],
    title: 'Remove tracks from library?',
    message: `Are you sure you want to remove ${tracksIds.length} element(s) from your library?`,
    type: 'warning'
  }, (result) => {
    if (result === 1) { // button possition, here 'remove'
      // Remove tracks from the Track collection
      app.models.Track.removeAsync({ _id: { $in: tracksIds } }, { multi: true });

      store.dispatch({
        type: types.APP_LIBRARY_REMOVE_TRACKS,
        payload: {
          tracksIds
        }
      });
      // That would be great to remove those ids from all the playlists, but it's not easy
      // and should not cause strange behaviors, all PR for that would be really appreciated
      // TODO: see if it's possible to remove the Ids from the selected state of TracksList as it "could" lead to strange behaviors
    }
  });
};

/**
 * Reset the library
 */
export const reset = async () => {
  try {
    const result = dialog.showMessageBox(app.browserWindows.main, {
      buttons: [
        'Cancel',
        'Reset'
      ],
      title: 'Reset library?',
      message: 'Are you sure you want to reset your library ? All your tracks and playlists will be cleared.',
      type: 'warning'
    });

    if (result === 1) {
      store.dispatch({
        type: types.APP_LIBRARY_REFRESH_START
      });

      await app.models.Track.removeAsync({}, { multi: true });
      await app.models.Playlist.removeAsync({}, { multi: true });

      store.dispatch({
        type: types.APP_LIBRARY_RESET
      });

      store.dispatch({
        type: types.APP_LIBRARY_REFRESH_END
      });

      await load();
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Update the play count attribute.
 */
export const incrementPlayCount = async (source: string) => {
  const query = { src: source }; // HACK Not great, should be done with an _id
  const update = { $inc: { playcount: 1 } };
  try {
    await app.models.Track.updateAsync(query, update);
  } catch (err) {
    console.warn(err);
  }
};
