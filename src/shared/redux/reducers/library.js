import i from 'icepick';
import extend from 'xtend';
import utils from '../../utils/utils';

export default (state = {}, action) => {
    switch (action.type) {

        case('LIBRARY/RESCAN_PENDING'): {
            return {
                ...state,
                status: 'An apple a day keeps Dr Dre away',
                refreshingLibrary: true
            };
        }

        case('LIBRARY/RESCAN_FULFILLED'): {
            return {
                ...state,
                refreshingLibrary: false,
                refreshProgress: 0
            };
        }

        case('LIBRARY/RESCAN_PROGRESS'): {
            return {
                ...state,
                refreshProgress: action.payload.percentage
            };
        }

        default: {
            return state;
        }
    }
};
