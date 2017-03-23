import Promise from 'bluebird';

const library = (lib) => {

    // const filterSearch = (search) => ({
    //     type: 'TRACKS/FILTER',
    //     payload: {
    //         search
    //     }
    // });

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
