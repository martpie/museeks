import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {
        case ('CONFIG/SET'): {
            return {
                ...state,
                ...extend(state, { [action.payload.key]: action.payload.value })
            };
        }

        case ('CONFIG/LOAD_FULFILLED'): {
            return {
                ...state,
                ...action.payload
            };
        }

        default: {
            return state;
        }
    }
};
