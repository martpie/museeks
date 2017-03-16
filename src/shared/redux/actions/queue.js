const utils = require( '../../utils/utils');

const library = (lib) => {

    const start = (index) => (dispatch, getState) => {
        // TODO (y.solovyov | KeitIG): calling getState is a hack.
        const { queue } = getState();
        const uri = utils.parseUri(queue[index].path);
        lib.player.setAudioSrc(uri);
        lib.player.play();

        return {
            type: 'APP_QUEUE_START',
            payload: {
                index
            }
        };
    };

    const clear = () => ({
        type: 'APP_QUEUE_CLEAR'
    });

    const remove = (index) => ({
        type: 'APP_QUEUE_REMOVE',
        payload: {
            index
        }
    });

    const add = (tracksIds) => ({
        type: 'APP_QUEUE_ADD',
        payload: lib.track.find({
            query: { _id: { $in: tracksIds } }
        })
    });

    const addNext = (tracksIds) => ({
        type : 'APP_QUEUE_ADD_NEXT',
        payload : lib.track.find({
            query : { _id: { $in: tracksIds } }
        })
    });

    const setQueue = (queue) => ({
        type : 'APP_QUEUE_SET_QUEUE',
        queue
    });

    return {
        add,
        addNext,
        clear,
        remove,
        start,
        setQueue
    };
}

module.exports = library;
