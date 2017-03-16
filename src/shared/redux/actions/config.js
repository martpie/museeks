const library = (lib) => {

    const set = (key, value) => (dispatch) => ({
        type: 'APP_CONFIG_SET',
        payload: lib.config.set(key, value),
        meta: { key, value }
    });

    const save = () => (dispatch) => ({
        type: 'APP_CONFIG_SAVE',
        payload: lib.config.set(key, value),
    });

    return {
        set,
        save
    }
}

module.exports = library;
