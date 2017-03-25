import Promise from 'bluebird';

const library = (lib) => {

    const filter = (search) => ({
        type: 'TRACKS/FILTER',
        payload: {
            search
        }
    });

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

    const incrementPlayCount = (_id, event) => (dispatch, getState) => {

        const { network : { output, me } } = getState();

        // create an event to track who listened to the song
        event = event || {
            user: me.hostname,
            date: Date.now()
        }

        const update = {
            $push: {
                playHistory: event
            },
            $inc: {
                playCount: 1
            }
        }

        // TODO: Jackson to ask David about accessing output from this sliver of store
        const outputIsLocal = () => lib.track.update({ _id }, update);
        const outputIsRemote = () => lib.api.actions.tracks.incrementPlayCount(output, _id, event);

        dispatch({
            type: 'TRACKS/PLAY_COUNT_INCREMENT',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                _id,
                event
            }
        });
    }

    return {
        find,
        setTracksCursor,
        remove,
        incrementPlayCount,
        filter
    }
}

export default library;
