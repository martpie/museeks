import api from '../api/handlers';
import actions from '../redux/actions';

const library = (lib) => {

    return {
        actions: actions(lib),
        api
    };
};

export default library;
