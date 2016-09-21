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
const realpathAsync = Promise.promisify(fs.realpath);

export default {

    load: function() {

        const querySort = {
            'loweredMetas.artist': 1,
            'year': 1,
            'loweredMetas.album': 1,
            'disk.no': 1,
            'track.no': 1
        };

        app.models.Track.find().sort(querySort).exec((err, tracks) => {
            if (err) console.warn(err);
            else {
                store.dispatch({
                    type : AppConstants.APP_REFRESH_LIBRARY,
                    tracks
                });
            }
        });
    },

    setTracksCursor: function(cursor) {
        store.dispatch({
            type : AppConstants.APP_LIBRARY_SET_TRACKSCURSOR,
            cursor
        });
    },

    resetTracks: function() {
        store.dispatch({
            type : AppConstants.APP_REFRESH_LIBRARY,
            tracks : null
        });
    },

    selectAndPlay: function(_id) {

        store.dispatch({
            type : AppConstants.APP_SELECT_AND_PLAY,
            _id
        });
    },

    filterSearch: function(search) {

        store.dispatch({
            type : AppConstants.APP_FILTER_SEARCH,
            search
        });
    },

    addFolders: function() {
        dialog.showOpenDialog({
            properties: ['openDirectory', 'multiSelections']
        }, (folders) => {
            if(folders !== undefined) {
                Promise.map(folders, (folder) => {
                    return realpathAsync(folder);
                }).then((resolvedFolders) => {
                    store.dispatch({
                        type : AppConstants.APP_LIBRARY_ADD_FOLDERS,
                        folders: resolvedFolders
                    });
                });
            }
        });
    },

    removeFolder: function(index) {
        store.dispatch({
            type : AppConstants.APP_LIBRARY_REMOVE_FOLDER,
            index
        });
    },

    reset: function() {

        store.dispatch({
            type : AppConstants.APP_LIBRARY_REFRESH_START,
        });

        // Need promises
        app.models.Track.remove({}, { multi: true }, (err) => {

            if(err) console.error(err);

            app.models.Playlist.remove({}, { multi: true }, (err) => {
                if(err) console.error(err);

                AppActions.library.load();
                store.dispatch({
                    type : AppConstants.APP_LIBRARY_REFRESH_END,
                });
            });
        });
    },

    refresh: function() {
        store.dispatch({
            type : AppConstants.APP_LIBRARY_REFRESH_START
        });

        const dispatchEnd = function() {
            store.dispatch({
                type : AppConstants.APP_LIBRARY_REFRESH_END
            });
        };
        const folders = app.config.get('musicFolders');
        const fsConcurrency = 64;

        const getMetadataAsync = function(track) {
            return new Promise((resolve) => {
                utils.getMetadata(track, resolve);
            });
        };

        // Start the big thing
        app.models.Track.removeAsync({}, { multi: true }).then(() => {
            return Promise.map(folders, (folder) => {
                const pattern = path.join(folder, '**/*.*');
                return globby(pattern, { nodir: true, follow: true });
            });
        }).then((filesArrays) => {
            return filesArrays.reduce((acc, array) => {
                return acc.concat(array);
            }, []).filter((filePath) => {
                const extension = path.extname(filePath).toLowerCase();
                return app.supportedExtensions.includes(extension);
            });
        }).then((supportedFiles) => {

            if (supportedFiles.length === 0) {
                dispatchEnd();
                return;
            }

            let addedFiles = 0;
            const totalFiles = supportedFiles.length;
            return Promise.map(supportedFiles, (filePath) => {
                return app.models.Track.findAsync({ path: filePath }).then((docs) => {
                    if (docs.length === 0) {
                        return getMetadataAsync(filePath);
                    }
                    return docs[0];
                }).then((track) => {
                    return app.models.Track.insertAsync(track);
                }).then(() => {
                    const percent = parseInt(addedFiles * 100 / totalFiles);
                    AppActions.settings.refreshProgress(percent);
                    addedFiles++;
                });
            }, { concurrency: fsConcurrency });
        }).then(() => {
            AppActions.library.load();
            dispatchEnd();
        }).catch((err) => {
            console.warn(err);
        });
    },

    fetchCover: function(path) {

        utils.fetchCover(path, (cover) => {
            store.dispatch({
                type : AppConstants.APP_LIBRARY_FETCHED_COVER,
                cover
            });
        });
    },

    /**
     * Update the play count attribute.
     *
     * @param source
     */
    incrementPlayCount(source) {
        app.models.Track.update({ src: source }, { $inc: { playcount : 1 } }, (err) => {
            if(err) {
                console.warn(err);
            }
        });
    }
};
