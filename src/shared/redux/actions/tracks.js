import Promise from 'bluebird';
import utils from '../../utils/utils';
import { pick } from 'lodash';

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

        if (!peer || utils.peerIsMe({ peer, me })) {
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

    const incrementPlayCount = (data) => (dispatch, getState) => {

        const { network : { output, me } } = getState();

        const { track } = data;

        const eventMetadata = ['title' , 'album', 'artist', 'loweredMetas.title', 'loweredMetas.album', 'loweredMetas.artist', 'playCount'];

        // create an event to track who listened to the song
        const playEvent = data.playEvent || {
            user: me.hostname,
            timestamp: Date.now(),
            ...pick(track, eventMetadata)
        };

        const playCountUpdate = {
            $inc: {
                playCount: 1
            }
        };

        // TODO: Jackson to ask David about accessing output from this sliver of store
        const outputIsLocal = () => Promise.all([
            lib.playEvent.insert(playEvent),
            lib.track.update({ _id: track._id }, playCountUpdate)
        ]);
        const outputIsRemote = () => lib.api.actions.tracks.incrementPlayCount(output, { track, playEvent });

        dispatch({
            type: 'TRACKS/PLAY_COUNT_INCREMENT',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                event
            }
        });
    };

    return {
        find,
        setTracksCursor,
        remove,
        incrementPlayCount,
        filter
    };
};

export default library;
