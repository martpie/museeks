import types from '../constants/action-types';

const initialState = null;

export default (state = initialState, payload) => {
  switch (payload.type) {
    case(types.APP_REFRESH_CONFIG): {
      return { ...state };
    }

    default: {
      return state;
    }
  }
};
