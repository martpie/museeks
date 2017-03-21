import actions from '../redux/actions';
import api from '../api/accessors';

const library = (lib) => {
    return {
        actions: actions(lib),
        api: api(lib)
    };
};

export default library;
