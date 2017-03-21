import Promise from 'bluebird';
import actions from './index.js';
import fs from 'fs';
import globby from 'globby';
import utils from '../../utils/utils';
import electron from 'electron';
import { join, extname } from 'path';
const realpath = Promise.promisify(fs.realpath);

const library = (lib) => {

    const load = () => {
        return {
            type: 'APP_LIBRARY_LOAD',
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
        }
    }

    const setTracksCursor = (cursor) => ({
        type: 'APP_LIBRARY_SET_TRACKSCURSOR',
        payload: {
            cursor
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
                    return realpath(folder);
                }).then((resolvedFolders) => {
                    const existingFolders = getState().config.musicFolders;
                    const musicFolders = existingFolders.concat(resolvedFolders);
                    const folders = utils.removeUselessFolders(musicFolders);
                    folders.sort();

                    dispatch(lib.actions.config.set('musicFolders', folders));
                    dispatch({
                        type: 'APP_LIBRARY_UPDATE_FOLDERS',
                        payload: {
                            folders
                        }
                    });
                });
             }
         });
    };

    const removeFolder = (index) => (dispatch, getState) => {
        const state = getState();
        if (!state.refreshingLibrary) {
            const folders = state.config.musicFolders;
            folders.splice(index, 1);

            dispatch(lib.actions.config.set('musicFolders', folders));
            dispatch({
                type: 'APP_LIBRARY_UPDATE_FOLDERS',
                payload: {
                    folders
                }
            });
        }
    };

    const remove = () => ({
        type: 'APP_LIBRARY_DELETE',
        payload: Promise.all([
            lib.track.remove({}, { multi: true }),
            lib.playlist.remove({}, { multi: true })
        ])
    });

    const rescan = () => (dispatch, getState) => {

        dispatch({ type: 'APP_LIBRARY_RESCAN_PENDING' });

        const folders = getState().config.musicFolders;
        const fsConcurrency = 32;

        return lib.track.remove({}, { multi: true }).then(() => {
            return Promise.map(folders, (folder) => {
                const pattern = join(folder, '**/*.*');
                return globby(pattern, { nodir: true, follow: true });
            });
        }).then((filesArrays) => {
            return filesArrays.reduce((acc, array) => acc.concat(array), []).filter((path) => {
                const extension = extname(path).toLowerCase();
                return utils.supportedExtensions.includes(extension);
            });
        }).then((supportedFiles) => {
            if (supportedFiles.length === 0) {
                return dispatchEnd();
            }

            const totalFiles = supportedFiles.length;
            return Promise.map(supportedFiles, (path, numAdded) => {
                return lib.track.find({ query: { path } })
                .then((docs) => docs.length === 0
                    ? utils.getMetadata(path)
                    : docs[0])
                .then(lib.track.insert)
                .then(() => {
                    const percent = parseInt(numAdded * 100 / totalFiles);
                    dispatch(lib.actions.settings.refreshProgress(percent));
                });
            }, { concurrency: fsConcurrency });
        }).then(() => {
            dispatch({ type: 'APP_LIBRARY_RESCAN_FULFILLED' });
            dispatch(lib.actions.library.load());
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
        return lib.track.update({ src }, { $inc: { playcount: 1 } });
    };

    return {
        load,
        setTracksCursor,
        filterSearch,
        addFolders,
        removeFolder,
        remove,
        rescan,
        fetchCover,
        incrementPlayCount
    };
};

export default library;
