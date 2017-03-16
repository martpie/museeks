const rpc = require('../../modules/rpc/rpc');

const library = (lib) => {

    const getAll = () => (dispatch) =>  ({
        type: 'APP_CONFIG_GET_ALL',
        payload: rpc('mainRenderer', 'config.getAll', '')
    });

    const set = (key, value) => (dispatch) => ({
        type: 'APP_CONFIG_SET',
        payload: rpc('mainRenderer', 'config.set', [key, value]),
        meta: { key, value }
    });


    const save = () => (dispatch) => ({
        type: 'APP_CONFIG_SAVE',
        payload: rpc('mainRenderer', 'config.saveSync', '')
    });

    return {
        getAll,
        set,
        save
    }
}

module.exports = library;
