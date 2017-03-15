import lib      from '../../lib';
import utils    from '../utils/utils';

import fs       from 'fs';
import path     from 'path';
import globby   from 'globby';
import Promise  from 'bluebird';

import supportedExtensions from '../../../shared/utils/supportedExtensions';

const dialog = electron.remote.dialog;
const realpath = Promise.promisify(fs.realpath);

const load = () {
    const sort = {
        'loweredMetas.artist': 1,
        'year': 1,
        'loweredMetas.album': 1,
        'disk.no': 1,
        'track.no': 1
    };

    return {
        type: 'APP_REFRESH_LIBRARY',
        payload: lib.tracks.find({
            query : {},
            sort
        })
    }
};

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

const addFolders = () => (dispatch) => ({
    dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections']
    }, (folders) => {
        if (folders !== undefined) {
            Promise.map(folders, realpath).then((resolvedFolders) => {
                dispatch({
                    type: 'APP_LIBRARY_ADD_FOLDERS',
                    folders: resolvedFolders
                });
            });
        }
    });
});

const removeFolder = (index) => {{
    type: 'APP_LIBRARY_REMOVE_FOLDER',
    payload: {
        index
    }
});

const reset = () => (dispatch) => ({
    type: 'APP_LIBRARY_REFRESH',
    payload: Promise.all([
        app.models.Track.removeAsync({}, { multi: true }),
        app.models.Playlist.removeAsync({}, { multi: true })
    ])
    .then(() => dispatch(actions.library.load()));
});

const refresh = () => (dispatch) => {
    dispatch({
        type: 'APP_LIBRARY_REFRESH_PENDING'
    });

    const dispatchEnd = () => {
        dispatch({
            type: 'APP_LIBRARY_REFRESH_FULFILLED'
        });
    };
    const folders = app.config.get('musicFolders');
    const fsConcurrency = 32;

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
            return supportedExtensions.includes(extension);
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
                    return utils.getMetadata(filePath);
                }
                return docs[0];
            }).then((track) => {
                return app.models.Track.insertAsync(track);
            }).then(() => {
                const percent = parseInt(addedFiles * 100 / totalFiles);
                dispatch(actions.settings.refreshProgress(percent));
                addedFiles++;
            });
        }, { concurrency: fsConcurrency });
    }).then(() => {
        dispatch(actions.library.load());
        dispatchEnd();
    }).catch((err) => {
        console.warn(err);
    });
};

const fetchCover = (path) => (dispatch) => {
    return utils.fetchCover(path).then((cover) =>
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
 * @param source
 */
const incrementPlayCount = async (source) => {
    const query = { src: source };
    const update = { $inc: { playcount : 1 } };
    return app.models.Track.updateAsync(query, update);
};

export default {
    load,
    list,
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
