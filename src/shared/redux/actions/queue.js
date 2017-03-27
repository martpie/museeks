import utils from  '../../utils/utils';
import { range } from 'range';

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
        payload: lib.track.find({
            query: { _id: { $in: tracksIds } }
        })
    });

    const setQueue = (queue) => ({
        type: 'QUEUE/SET_QUEUE',
        payload: {
            queue
        }
    });

    const setQueueCursor = (queueCursor) => (dispatch, getState) => {
        const { queue } = getState();
        lib.player.setMetadata(queue[queueCursor]);
        console.log('queue[index]queue[index]queue[index]queue[index]queue[index]', queue[queueCursor])

        return {
            type: 'QUEUE/SET_QUEUE_CURSOR',
            payload: {
                queueCursor
            }
        };
    };

    return {
        add,
        addNext,
        clear,
        remove,
        setQueue,
        setQueueCursor
    };
}

export default library;
