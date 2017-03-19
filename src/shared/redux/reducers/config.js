import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {
        case('APP_CONFIG_LOAD'): {
            return {
                ...state,
                config: action.payload.config
            }
        }

        default: {
            return state;
        }
    }
};
