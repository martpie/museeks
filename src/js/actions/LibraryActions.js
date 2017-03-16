import store from '../store.js';

import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app   from '../lib/app';
import utils from '../utils/utils';

import fs       from 'fs';
import path     from 'path';
import globby   from 'globby';
import Promise  from 'bluebird';

const dialog = electron.remote.dialog;
const statAsync = Promise.promisify(fs.stat);

const load = async () => {
    const querySort = {
        'loweredMetas.artist': 1,
        'year': 1,
        'loweredMetas.album': 1,
        'disk.no': 1,
        'track.no': 1
    };

    try {
        const tracks = await app.models.Track.find().sort(querySort).execAsync();
        store.dispatch({
            type : AppConstants.APP_REFRESH_LIBRARY,
            tracks
        });
    } catch (err) {
        console.warn(err);
    }
};

const setTracksCursor = (cursor) => {
    store.dispatch({
        type : AppConstants.APP_LIBRARY_SET_TRACKSCURSOR,
        cursor
    });
};

const resetTracks = () => {
    store.dispatch({
        type : AppConstants.APP_REFRESH_LIBRARY,
        tracks : null
    });
};

const filterSearch = (search) => {
    store.dispatch({
        type : AppConstants.APP_FILTER_SEARCH,
        search
    });
};

const scan = {
    processed: 0,
    total: 0,
};

const scanIsOver = () => {
    return scan.processed === scan.total;
};

const add = (pathsToScan) => {
    store.dispatch({
        type : AppConstants.APP_LIBRARY_REFRESH_START
    });


    const endCurrentScan = function() {
        if(scanIsOver()) {
            store.dispatch({
                type : AppConstants.APP_LIBRARY_REFRESH_END
            });
        }
    };

    // We may have a problem with this if the user do a lot of concurrent scan
    // I lowered this value from 32 to prevent ERROPEN with a least two concurrent scans
    const fsConcurrency = 16;

    let rootFiles; // HACK Kind of hack, looking for a better solution

    // Scan folders and add files to library
    new Promise((resolve) => {
        const paths = Promise.map(pathsToScan, (path) => {
            return statAsync(path).then((stat) => {
                return {
                    path,
                    stat
                };
            });
        });

        resolve(paths);
    }).then((paths) => {
        const files = [];
        const folders = [];

        paths.forEach((elem) => {
            if(elem.stat.isFile()) files.push(elem.path);
            if(elem.stat.isDirectory() || elem.stat.isSymbolicLink()) folders.push(elem.path);
        });

        rootFiles = files;

        return Promise.map(folders, (folder) => {
            const pattern = path.join(folder, '**/*.*');
            return globby(pattern, { nodir: true, follow: true });
        });
    }).then((files) => {
        // Merge all path arrays together and filter them with the extensions we support
        const flatFiles = files.reduce((acc, array) => acc.concat(array), [])
            .concat(rootFiles)
            .filter((filePath) => {
                const extension = path.extname(filePath).toLowerCase();
                return app.supportedExtensions.includes(extension);
            }
        );

        return flatFiles;
    }).then((supportedFiles) => {
        if (supportedFiles.length === 0) {
            endCurrentScan();
            return;
        }

        // Add files to be processed to the scan object
        scan.total += supportedFiles.length;

        return Promise.map(supportedFiles, (filePath) => {
            return app.models.Track.findAsync({ path: filePath }).then((docs) => {
                if (docs.length === 0) {
                    return utils.getMetadata(filePath);
                }
                return null;
            }).then((track) => {
                // If null, that means a track with the same absolute path already exists in the database
                if(track === null) return;
                // else, insert the new document in the database
                return app.models.Track.insertAsync(track);
            }).then(() => {
                refreshProgress(scan.processed, scan.total);
                scan.processed++;
            });
        }, { concurrency: fsConcurrency });
    }).then(() => {
        AppActions.library.load(); // TODO Reload the library at the end of this
        endCurrentScan();
    }).catch((err) => {
        console.warn(err);
    });

    // TODO progressive loading in the store, don't freeze the app, able to add files/folders when scanning
};

const refreshProgress = (processed, total) => {
    store.dispatch({
        type : AppConstants.APP_LIBRARY_REFRESH_PROGRESS,
        processed,
        total,
    });
};

const removeFromLibrary = async (tracksIds) => {
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
        if(result === 1) {
            // Remove tracks from the Track collection
            app.models.Track.removeAsync({ _id: { $in: tracksIds } }, { multi: true }, () => {
                store.dispatch({
                    type : AppConstants.APP_LIBRARY_REMOVE_TRACKS,
                    tracksIds,
                });
            });
            // That would be great to remove those ids from all the playlists, but it's not easy
            // and should not cause strange behaviors, all PR for that would be really appreciated
            // TODO: see if it's possible to remove the Ids from the selected state of TracksList as it "could" lead to strange behaviors
        }
    });
};

const reset = async () => {
    try {
        const result = await dialog.showMessageBox(app.browserWindows.main, {
            buttons: [
                'Cancel',
                'Reset'
            ],
            title: 'Reset library?',
            message: 'Are you sure you want to reset your library ? All your tracks and playlists will be cleared.',
            type: 'warning'
        });

        if(result === 1) {
            store.dispatch({
                type : AppConstants.APP_LIBRARY_REFRESH_START,
            });

            await app.models.Track.removeAsync({}, { multi: true });
            await app.models.Playlist.removeAsync({}, { multi: true });

            AppActions.library.load();
            store.dispatch({
                type : AppConstants.APP_LIBRARY_REFRESH_END,
            });
        }
    } catch(err) {
        console.error(err);
    }
};

const fetchCover = async (path) => {
    const cover = await utils.fetchCover(path);
    store.dispatch({
        type : AppConstants.APP_LIBRARY_FETCHED_COVER,
        cover
    });
};

/**
 * Update the play count attribute.
 *
 * @param source
 */
const incrementPlayCount = async (source) => {
    const query = { src: source };
    const update = { $inc: { playcount : 1 } };
    try {
        await app.models.Track.updateAsync(query, update);
    } catch (err) {
        console.warn(err);
    }
};


export default {
    add,
    load,
    setTracksCursor,
    resetTracks,
    filterSearch,
    removeFromLibrary,
    reset,
    fetchCover,
    incrementPlayCount
};
