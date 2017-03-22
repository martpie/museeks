import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {
        case('CONFIG/SET'): {
            return {
                ...state,
                config: extend(state.config, { [action.payload.key]: action.payload.value })
            }
        }

        case('CONFIG/LOAD_FULFILLED'): {
            return {
                ...state,
                config: action.payload
            }
        }

        case('CONFIG/MERGE'): {
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
