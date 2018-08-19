import types from '../constants/action-types';
import { Action } from '../typings/interfaces';

export type AppState = null;

const initialState = null;

export default (state = initialState, action: Action) => {
  switch (action.type) {
    case (types.APP_REFRESH_CONFIG): {
      // Nothing particular here for the moment
      return state;
    }

    default: {
      return state;
    }
  }
};
