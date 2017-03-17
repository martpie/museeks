import { hashHistory } from 'react-router';

const library = (lib) => {

    const load = (_id) => (dispatch) => {
        const getPlaylist = lib.playlist.findOne({ query: { _id } });
        const getPlaylistTracks = (playlist) => lib.track.find({
            query: { _id: { $in: playlist.tracks } }
        });

        return getPlaylist.then(getPlaylistTracks).then((tracks) => {
            return dispatch({
                type: 'APP_PLAYLISTS_LOAD_ONE',
                payload: {
                    tracks
                }
            });
        });
    };

    const refresh = () => (dispatch) => {
        return lib.playlist.find({
            query: {},
            sort: { name: 1 }
        }).then((playlists) => {
            return dispatch({
                type: 'APP_PLAYLISTS_REFRESH',
                payload: {
                    playlists
                }
            });
        });
    };

    // DR: call site must be updated for dispatch style function
    const create = (name, redirect = false) => (dispatch) => {
        return lib.playlist.insert({
            name,
            tracks: []
        }).then((doc) => {
            if (redirect) {
                hashHistory.push(`/playlists/${doc._id}`);
            } else {
                dispatch(lib.actions.toasts.add('success', `The playlist '${name}' was created`));
            }

            dispatch(refresh());
            return doc._id;
        });
    };

    const rename = (_id, name) => (dispatch) => {
        return lib.playlist.update({ _id }, { $set: { name } }).then(() => {
            return dispatch(refresh());
        });
    };

    const remove = (_id) => (dispatch) => {
        return lib.playlist.remove({ _id }).then(() => {
            return dispatch(refresh());
        });
    };

    const addTracksTo = (_id, newTracks, isShown) => (dispatch) => {
        // isShown should never be true, letting it here anyway to remember of a design issue
        if (isShown) return;

        return lib.playlist.findOne({ query: { _id } }).then((playlist) => {
            const tracks = playlist.tracks.concat(newTracks);
            return lib.playlist.update({ _id }, { $set: { tracks } }).then(() => {
                return dispatch(lib.actions.toasts.add('success', `${tracks.length} tracks were successfully added to '${playlist.name}'`));
            });
        })
        .catch((err) => dispatch(lib.actions.toasts.add('danger', err)));
    };

    const removeTracksFrom = (_id, deletedTracks) => (dispatch) => {
        return lib.playlist.findOne({ query: { _id } }).then((playlist) => {
            const tracks = playlist.tracks.filter(track => !deletedTracks.includes(track));
            return lib.playlist.update({ _id }, { $set: { tracks } }).then(() => {
                return dispatch(load(_id));
            });
        });
    };

    return {
        load,
        refresh,
        create,
        rename,
        remove,
        addTracksTo,
        removeTracksFrom
    };
}

export default library;
