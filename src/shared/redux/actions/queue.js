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

    return {
        add,
        addNext,
        clear,
        remove,
        setQueue
    };
};

export default library;
