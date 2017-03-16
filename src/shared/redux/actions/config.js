const rpc = require('../../modules/rpc/rpc');

const getAll = () => (dispatch) =>  {
    return {
        type : 'APP_CONFIG_GET_ALL',
        payload : rpc(dispatch, 'mainRenderer', 'config.getAll')
    }

const set = (key, value) => (dispatch) => {
    return {
        type : 'APP_CONFIG_SET',
        payload : rpc(dispatch, 'mainRenderer', 'config.set', [key, value]),
        meta: { key, value }
    }
};

const save = () => (dispatch) => {
    return {
        type : 'APP_CONFIG_SAVE',
        payload: rpc(dispatch, 'mainRenderer', 'config.saveSync')
    }
};

module.exports = {
    getAll,
    set,
    save
};
