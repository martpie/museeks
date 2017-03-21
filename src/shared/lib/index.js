import actions from '../redux/actions';
import api from '../api/accessors';

const library = (lib) => {

    lib.api = api(lib);
    lib.actions = actions(lib);

    return lib;
};

export default library;
