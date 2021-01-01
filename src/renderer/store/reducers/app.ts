import types from '../action-types';
import { Action } from '../../../shared/types/museeks';

export type AppState = null;

const initialState = null;

export default (state = initialState, action: Action) => {
  switch (action.type) {
    case types.REFRESH_CONFIG: {
      // Nothing particular here for the moment
      return state;
    }

    default: {
      return state;
    }
  }
};
