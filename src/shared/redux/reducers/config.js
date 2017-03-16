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

        default: {
            return state;
        }
    }
};
