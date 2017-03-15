import AppConstants from '../constants/AppConstants';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_REFRESH_LIBRARY+'_FULFILLED'): {
            console.log(AppConstants.APP_REFRESH_LIBRARY+'_FULFILLED', payload);
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

        case(AppConstants.APP_REFRESH_CONFIG): {
            return { ...state };
        }

        default: {
            return state;
        }
    }
};
