export default (state = {}, action) => {
    switch (action.type) {
        case('APP_REFRESH_LIBRARY_FULFILLED'): {
            return {
                ...state,
                tracks: {
                    library: {
                        all: [...action.payload],
                        sub: [...action.payload]
                    },
                    playlist: {
                        all: [],
                        sub: []
                    }
                }
            };
        }

        case('APP_REFRESH_CONFIG'): {
            return { ...state };
        }

        default: {
            return state;
        }
    }
};
