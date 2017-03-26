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

    const moveCursor = ({ direction }) => (dispatch, getState) => {

        let {
            player: { repeat, shuffle, history, historyCursor },
            queue,
            queueCursor
        } = lib.store.getState();

        const newHistory = history.slice();

        console.log({ direction, queue, queueCursor, repeat, shuffle, history, historyCursor })

        const calculateCursor = lib.player.getAudio().then((audio) => {

            const inHistory = historyCursor !== -1;

            const getNextQueueCursor = () => {
                if (repeat === 'one') {
                    return queueCursor;
                }
                else if (shuffle) {
                    const choices = range(0, queue.length).filter((choice) => choice !== queueCursor);
                    return utils.pickRandom(choices);
                }
                else if (repeat === 'all' && queueCursor === queue.length - 1) { // is last track
                    return 0; // start with new track
                }
                else if (queueCursor === queue.length - 1) { // is last track
                    return null; // stop playing
                } else {
                    return queueCursor + 1;
                }
            }

            // if there's no player state
            if (!historyCursor && !queueCursor) {
                // initialise the cursors
                historyCursor = -1;
                queueCursor = 0;
            }
            else if (direction === 'previous') {

                // early exit: if track started less than 5 seconds ago,
                // play the previous track, otherwise replay the current one
                if (audio.currentTime < 5) {
                    return inHistory
                        ? history[historyCursor - 1]
                        : queue[queueCursor - 1];
                }

                // if we're currently playing a track from our history
                if (inHistory) {
                    // move one step back in the history
                    historyCursor = historyCursor - 1;

                    if (historyCursor === -1) {
                        // we tried to move past the head of the history queue, stay at the top
                        historyCursor = 0;
                    }
                } else {
                    // set the history cursor to the end of the history queue
                    historyCursor = history.length - 1;
                }
            }
            else if (direction === 'next') {

                // if we're currently playing a track from our history
                if (inHistory) {
                    // move one step forward in the history
                    historyCursor = historyCursor + 1;

                    // if we moved past the tail of the history queue
                    if (historyCursor === history.length) {
                        // disable the history cursor
                        historyCursor = -1;
                        // initiate the main queue cursor
                        queueCursor = getNextQueueCursor();
                    }
                } else {
                    // set the queue cursor to the next track
                    queueCursor = getNextQueueCursor();
                }
            }

            return {
                queueCursor,
                historyCursor
            }
        });

        return {
            type: 'QUEUE/MOVE_CURSOR_FULFILLED',
            payload: calculateCursor
        }
    }

    return {
        add,
        addNext,
        clear,
        remove,
        setQueue,
        setQueueCursor,
        moveCursor
    };
}

export default library;
