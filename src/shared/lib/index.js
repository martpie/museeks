const api = require('../api');

const library = (lib) => {
    const actions = require('../redux/actions')(lib);

    return {
        actions,
        api,
    };
};

module.exports = library;
