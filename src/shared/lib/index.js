import api from '../api';

const library = (lib) => {
    const actions = require('../redux/actions')(lib);

    return {
        actions,
        api
    };
};

export default library;
