import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {
        case('APP_CONFIG_SET'): {
            return {
                ...state,
                config: extend(state.config, { [action.payload.key]: action.payload.value })
            }
        }

        case('APP_CONFIG_LOAD_FULFILLED'): {
            return {
                ...state,
                config: action.payload
            }
        }

        case('APP_CONFIG_MERGE'): {
            return {
                ...state,
                config: extend(state.config, action.payload.config)
            }
        }

        default: {
            return state;
        }
    }
};
