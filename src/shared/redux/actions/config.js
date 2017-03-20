const library = (lib) => {

    const set = (key, value) => {
        return (dispatch) => ({
            type: 'APP_CONFIG_SET',
            payload: lib.config.set(key, value).then(() => dispatch(lib.actions.config.save()))
        });
    }

    const save = () => ({
        type: 'APP_CONFIG_SAVE',
        payload: lib.config.save()
    });

    const load = (config) => ({
        type: 'APP_CONFIG_LOAD',
        payload: {
            config
        }
    });

    const merge = (config) => ({
        type: 'APP_CONFIG_MERGE',
        payload: {
            config
        }
    });

    return {
        set,
        save,
        load,
        merge
    }
}

export default library;
