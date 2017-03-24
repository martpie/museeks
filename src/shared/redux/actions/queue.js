import utils from  '../../utils/utils';

const library = (lib) => {

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

    const setCursor = (index) => (dispatch, getState) => {
        const { queue } = getState();
        lib.player.setMetadata(queue[index]);
        console.log('queue[index]queue[index]queue[index]queue[index]queue[index]', queue[index])

        return {
            type: 'QUEUE/SET_CURSOR',
            payload: {
                index
            }
        };
    };

    return {
        add,
        addNext,
        clear,
        remove,
        setQueue,
        setCursor
    };
}

export default library;
