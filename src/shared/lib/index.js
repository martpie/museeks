import actions from '../redux/actions';
import api from '../api/accessors';
import utils from './utils';

const library = (lib) => {

    lib.api = api(lib);
    lib.actions = actions(lib);
    lib.utils = utils(lib);

    return lib;
};

export default library;
