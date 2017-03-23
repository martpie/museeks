import Promise from 'bluebird';

const library = (lib) => {

    const find = ({ peer, query, sort } = {}) => (dispatch, getState) => {
        const { network : { me } } = getState();

        if (!peer || lib.utils.peerIsMe(peer)) {
            dispatch({
                type: 'TRACK/FIND',
                payload: lib.track.find({ query, sort }),
                meta: {
                    owner: me
                }
            });
        } else {
            dispatch({
                type: 'TRACK/FIND',
                payload: lib.api.track.find(peer, { query, sort }),
                meta: {
                    owner: peer
                }
            });
        }
    };

    // const play = ({ source, destination, track } = {}) => {
    //     return {
    //         type: 'NETWORK/START',
    //         payload: {
    //             peer
    //         }
    //     }
    // };

    return {
        find
    }
}

export default library;
