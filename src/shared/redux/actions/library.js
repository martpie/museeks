const Promise  = require('bluebird');
const actions  = require('./index.js');
const fs       = require('fs');
const globby   = require('globby');
const join     = require('path').join;
const extname  = require('path').extname;
const utils    = require('../../utils/utils');
const electron = require('electron');
const realpath = Promise.promisify(fs.realpath);

const library = (lib) => {

    const load = () => ({
        type: 'APP_REFRESH_LIBRARY',
        payload: lib.track.find({
            query: {},
            sort: {
                'loweredMetas.artist': 1,
                'year': 1,
                'loweredMetas.album': 1,
                'disk.no': 1,
                'track.no': 1
            }
        })
    });

    const setTracksCursor = (cursor) => ({
        type: 'APP_LIBRARY_SET_TRACKSCURSOR',
        payload: {
            cursor
        }
    });

    const resetTracks = () => ({
        type: 'APP_REFRESH_LIBRARY',
        payload: {
            tracks : null
        }
    });

    const filterSearch = (search) => ({
        type: 'APP_FILTER_SEARCH',
        payload: {
            search
        }
    });

    const addFolders = () => (dispatch, getState) => {
        const dialog = electron.remote
            ? electron.remote.dialog
            : electron.dialog;

        dialog.showOpenDialog({
             properties: ['openDirectory', 'multiSelections']
        }, (folders) => {
            if (folders !== undefined) {
                Promise.map(folders, (folder) => {
                    return realpath(folder)
                }).then((resolvedFolders) => {
                    let musicFolders = getState().config.musicFolders;
                    // Check if we received folders
                    if (resolvedFolders !== undefined) {
                        musicFolders = musicFolders.concat(resolvedFolders);
                        // Remove duplicates, useless children, ect...
                        musicFolders = utils.removeUselessFolders(musicFolders);
                        musicFolders.sort();
                        dispatch(lib.actions.config.set('musicFolders', musicFolders));
                        dispatch(lib.actions.config.save());
                    }
                 });
             }
         });
    };

    const removeFolder = (index) => (dispatch) => {
        const state = getState();
        if (!state.library.refreshingLibrary) {
            const musicFolders = state.config.musicFolders;
            musicFolders.splice(index, 1);
            dispatch(lib.actions.config.set('musicFolders', musicFolders));
            dispatch(lib.actions.config.save());
        }
    };

    const reset = () => (dispatch) => ({
        type: 'APP_LIBRARY_REFRESH',
        payload: Promise.all([
            lib.track.remove({}, { multi: true }),
            lib.playlist.remove({}, { multi: true })
        ])
        .then(() => dispatch(lib.actions.library.load()))
    });

    const refresh = () => (dispatch, getState) => {
        dispatch({
            type: 'APP_LIBRARY_REFRESH_PENDING'
        });

        const dispatchEnd = () => {
            dispatch({
                type: 'APP_LIBRARY_REFRESH_FULFILLED'
            });
        };
        const folders = getState().config.musicFolders;
        const fsConcurrency = 32;

        // Start the big thing
        return lib.track.remove({}, { multi: true }).then(() => {
            return Promise.map(folders, (folder) => {
                const pattern = join(folder, '**/*.*');
                return globby(pattern, { nodir: true, follow: true });
            });
        }).then((filesArrays) => {
            return filesArrays.reduce((acc, array) => {
                return acc.concat(array);
            }, []).filter((path) => {
                const extension = extname(path).toLowerCase();
                return utils.supportedExtensions.includes(extension);
            });
        }).then((supportedFiles) => {
            if (supportedFiles.length === 0) {
                return dispatchEnd();
            }

            let addedFiles = 0;
            const totalFiles = supportedFiles.length;
            return Promise.map(supportedFiles, (path) => {
                return lib.track.find({ query : { path } }).then((docs) => {
                    if (docs.length === 0) {
                        return utils.getMetadata(path);
                    }
                    return docs[0];
                }).then((track) => {
                    return lib.track.insert(track);
                }).then(() => {
                    const percent = parseInt(addedFiles * 100 / totalFiles);
                    dispatch(lib.actions.settings.refreshProgress(percent));
                    addedFiles++;
                });
            }, { concurrency: fsConcurrency });
        }).then(() => {
            dispatch(lib.actions.library.load());
            dispatchEnd();
        }).catch((err) => {
            console.warn(err);
        });
    };

    const fetchCover = (path) => (dispatch) => {
        utils.fetchCover(path).then((cover) => {
            dispatch({
                type: 'APP_LIBRARY_FETCHED_COVER',
                payload: {
                    cover
                }
            });
        });
    };

    /**
     * Update the play count attribute.
     *
     * @param src
     */
    const incrementPlayCount = (src) => {
        return lib.track.update({ src }, { $inc: { playcount : 1 } });
    };

    return {
        load,
        setTracksCursor,
        resetTracks,
        filterSearch,
        addFolders,
        removeFolder,
        reset,
        refresh,
        fetchCover,
        incrementPlayCount
    };
};

module.exports = library;
