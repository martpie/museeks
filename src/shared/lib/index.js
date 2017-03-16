const api = require('../api');
const app = require('./app');

const library = (lib) => {
    const actions = require('../redux/actions')(lib);

    return {
        actions,
        api,
        app
    };
};

module.exports = library;
