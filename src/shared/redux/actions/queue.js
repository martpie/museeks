import utils from  '../../utils/utils';

const library = (lib) => {

    const start = (index) => (dispatch, getState) => {
        const { queue } = getState();
        lib.player.setMeta(queue[index]);
        lib.player.play();

        return {
            type: 'QUEUE/START',
            payload: {
                index
            }
        };
    };

    const clear = () => ({
        type: 'QUEUE/CLEAR'
    });

    const remove = (index) => ({
        type: 'QUEUE/REMOVE',
        payload: {
            index
        }
    });

    const add = (tracksIds) => ({
        type: 'QUEUE/ADD',
        payload: lib.track.find({
            query: { _id: { $in: tracksIds } }
        })
    });

    const addNext = (tracksIds) => ({
        type: 'QUEUE/ADD_NEXT',
        payload: ib.track.find({
            query: { _id: { $in: tracksIds } }
        })
    });

    const setQueue = (queue) => ({
        type: 'QUEUE/SET_QUEUE',
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
