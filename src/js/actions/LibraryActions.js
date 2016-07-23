import store from '../store.js';

import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app   from '../utils/app';
import utils from '../utils/utils';

import path     from 'path';
import globby   from 'globby';
import Promise  from 'bluebird';

const dialog = electron.remote.dialog;


export default {

    load: function() {

        app.db.find({ type : 'track' }).sort({ 'loweredMetas.artist': 1, 'year': 1, 'loweredMetas.album': 1, 'disk.no': 1, 'track.no': 1 }).exec((err, tracks) => {
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
            tracks     : null
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

        dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] }, (folders) => {
            if(folders !== undefined) {
                store.dispatch({
                    type : AppConstants.APP_LIBRARY_ADD_FOLDERS,
                    folders
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

        app.db.remove({ }, { multi: true }, (err) => {
            if(err) console.error(err);
            app.db.loadDatabase((err) => {
                if(err) {
                    console.warn(err);
                } else {
                    AppActions.library.load();
                    store.dispatch({
                        type : AppConstants.APP_LIBRARY_REFRESH_END,
                    });
                }
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
        const supportedExtensionsGlob = `**/*.{${ app.supportedExtensions.join() }}`;
        const fsConcurrency = 64;

        const getMetadataAsync = function(track) {
            return new Promise((resolve) => {
                utils.getMetadata(track, resolve);
            });
        };

        // Start the big thing
        app.db.removeAsync({ type : 'track' }, { multi: true }).then(() => {
            return app.db.loadDatabaseAsync();
        }).then(() => {
            return Promise.map(folders, (folder) => {
                const pattern = path.join(folder, supportedExtensionsGlob);
                return globby(pattern, { nodir: true, follow: true });
            });
        }).then((filesArrays) => {
            return filesArrays.reduce((acc, array) => {
                return acc.concat(array);
            }, []);
        }).then((supportedFiles) => {

            if (supportedFiles.length === 0) {
                dispatchEnd();
                return;
            }

            let filesInLibrary = 0;
            return Promise.map(supportedFiles, (filePath) => {
                return app.db.findAsync({ path: filePath }).then((docs) => {
                    if (docs.length === 0) {
                        return getMetadataAsync({ path: filePath });
                    }
                    return docs[0];
                }).then((metadata) => {
                    return app.db.insertAsync(metadata);
                }).then(() => {
                    AppActions.settings.refreshProgress(parseInt(filesInLibrary * 100 / supportedFiles.length));
                    filesInLibrary++;
                });
            }, { concurrency: fsConcurrency });
        }).then(() => {
            AppActions.library.load();
            dispatchEnd();
        }).catch((err) => {
            console.warn(err);
        });
    }
};
