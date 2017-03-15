module.exports = (state = {}, action) => {
    switch (action.type) {
        case('APP_CONFIG_GET_ALL_FULFILLED'): {
            return {
                ...state,
                ...action.payload
            };
        }

        case('APP_CONFIG_SET_FULFILLED'): {
            return {
                ...state,
                action.meta.key: action.meta.value
            };
        }

        case('APP_CONFIG_SAVE_FULFILLED'): {
            return state;
        }

        default: {
            return state;
        }
    }
};
