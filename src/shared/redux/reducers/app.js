export default (state = {}, payload) => {
    switch (payload.type) {
        case('APP_REFRESH_LIBRARY_FULFILLED'): {
            console.log('APP_REFRESH_LIBRARY_FULFILLED', payload);
            return state;
            // return {
            //     ...state,
            //     tracks: {
            //         library: {
            //             all: [...payload.tracks],
            //             sub: [...payload.tracks]
            //         },
            //         playlist: {
            //             all: [],
            //             sub: []
            //         }
            //     }
            // };
        }

        case('APP_REFRESH_CONFIG'): {
            return { ...state };
        }

        default: {
            return state;
        }
    }
};
