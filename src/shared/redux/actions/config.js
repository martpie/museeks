const library = (lib) => {

    const load = () => ({
        type: 'CONFIG/LOAD',
        payload: lib.config.load()
    });

    const save = () => (dispatch, getState) => ({
        type: 'CONFIG/SAVE',
        payload: lib.config.save(getState().config)
    });

    const set = (key, value, throttle) => (dispatch) => {
        dispatch({
            type: 'CONFIG/SET',
            payload: {
                key,
                value,
            },
            meta: {
                ...( throttle
                ? { throttle }
                : {})
            }
        });

        // We save in the next loop so the state has time to update
        setTimeout(() => dispatch(save()), 1);
    };

    return {
        set,
        save,
        load
    };
};

export default library;
