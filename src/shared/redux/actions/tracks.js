import Promise from 'bluebird';

const library = (lib) => {

    const filter = (search) => ({
        type: 'TRACKS/FILTER',
        payload: {
            search
        }
    });
    //
    // const filter = (search) => (dispatch, getState) => {
    //     const { all: tracks } = getState().tracks.library;
    //
    //     if (!search) {
    //         return tracks;
    //     } else {
    //         const search = utils.stripAccents(search);
    //
    //         const tracks = [...state[state.tracksCursor].all].filter((track) => { // Problem here
    //             return track.loweredMetas.artist.join().includes(search)
    //                 || track.loweredMetas.album.includes(search)
    //                 || track.loweredMetas.genre.join().includes(search)
    //                 || track.loweredMetas.title.includes(search);
    //         });
    //     }
    //
    //     return {
    //         type: 'TRACKS/FILTER',
    //         payload: {
    //             search
    //         }
    //     }
    // );


    const remove = () => ({
        type: 'TRACKS/DELETE',
        payload: Promise.all([
            lib.track.remove({}, { multi: true }),
            lib.playlist.remove({}, { multi: true })
        ])
    });

    const setTracksCursor = (cursor) => ({
        type: 'TRACKS/SET_TRACKSCURSOR',
        payload: {
            cursor
        }
    });

    const find = ({ peer, query, sort } = {}) => (dispatch, getState) => {
        const { network : { me } } = getState();

        if (!peer || lib.utils.peerIsMe(peer)) {
            dispatch({
                type: 'TRACKS/FIND',
                payload: lib.track.find({ query, sort }),
                meta: {
                    owner: me
                }
            });
        } else {
            dispatch({
                type: 'TRACKS/FIND',
                payload: lib.api.track.find(peer, { query, sort }),
                meta: {
                    owner: peer
                }
            });
        }
    };

    return {
        find,
        setTracksCursor,
        remove,
        // filterSearch
    }
}

export default library;
