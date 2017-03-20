const library = (lib) => {

    const set = (key, value) => {
        return (dispatch) => ({
            type: 'APP_CONFIG_SET',
            payload: {
              key,
              value
            }
        });
    }

    const save = () => (dispatch, getState) => ({
        type: 'APP_CONFIG_SAVE',
        payload: lib.config.save(getState().config)
    });

    const load = (config) => ({
        type: 'APP_CONFIG_LOAD',
        payload: lib.config.load()
    });

    return {
        set,
        save,
        load,
    }
}

export default library;
