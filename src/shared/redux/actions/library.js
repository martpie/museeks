import Promise from 'bluebird';
import actions from './index.js';
import fs from 'fs';
import globby from 'globby';
import utils from '../../utils/utils';
import electron from 'electron';
import { join, extname } from 'path';
const realpath = Promise.promisify(fs.realpath);

const library = (lib) => {

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
                });
             }
         });
    };

    const removeFolder = (index) => (dispatch, getState) => {
        const state = getState();
        if (!state.library.refreshingLibrary) {
            const folders = state.config.musicFolders;
            folders.splice(index, 1);

            dispatch(lib.actions.config.set('musicFolders', folders));
        }
    };

    const rescan = () => (dispatch, getState) => {

        dispatch({ type: 'LIBRARY/RESCAN_PENDING' });
        const dispatchEnd = () => dispatch({ type: 'LIBRARY/RESCAN_FULFILLED' });

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
            dispatchEnd();
            dispatch(lib.actions.network.find());
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
        addFolders,
        removeFolder,
        rescan,
        incrementPlayCount
    };
};

export default library;
