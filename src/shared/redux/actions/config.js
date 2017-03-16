const rpc = require('../../modules/rpc/rpc');

const library = (lib) => {

    const getAll = () => (dispatch) =>  ({
        type: 'APP_CONFIG_GET_ALL',
        payload: aliasEmit(dispatch, 'config.getAll', '', 'mainRenderer')
    });

    const set = (key, value) => (dispatch) => ({
        type: 'APP_CONFIG_SET',
        payload: aliasEmit(dispatch, 'app.library.config.set', [key, value]),
        meta: { key, value }
    });


    const save = () => (dispatch) => ({
        type: 'APP_CONFIG_SAVE',
        payload: aliasEmit(dispatch, 'app.library.config.saveSync', '')
    });

    return {
        getAll,
        set,
        save
    }
}

module.exports = library;
