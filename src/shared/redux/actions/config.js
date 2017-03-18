const library = (lib) => {

    const set = (key, value) => (dispatch) => ({
        type: 'APP_CONFIG_SET',
        payload: lib.config.set(key, value),
        meta: { key, value }
    });

    const save = () => ({
        type: 'APP_CONFIG_SAVE',
        payload: lib.config.save()
    });

    return {
        set,
        save
    }
}

export default library;
