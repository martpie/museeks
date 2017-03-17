import utils from  '../../utils/utils';

const library = (lib) => {

    const start = (index) => (dispatch, getState) => {
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
        type: 'APP_QUEUE_ADD_NEXT',
        payload : lib.track.find({
            query : { _id: { $in: tracksIds } }
        })
    });

    const setQueue = (queue) => ({
        type: 'APP_QUEUE_SET_QUEUE',
        payload: {
            queue
        }
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

export default library;
