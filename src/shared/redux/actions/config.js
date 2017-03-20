const library = (lib) => {

    const set = (key, value) => (dispatch) => ({
        type: 'APP_CONFIG_SET',
        payload: lib.config.set(key, value).then(lib.config.save),
        meta: { key, value }
    });

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

    return {
        set,
        save,
        load
    }
}

export default library;
