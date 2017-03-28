import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import reduceReducers from 'reduce-reducers';
import thunk from 'redux-thunk';

import reducers from '../../../shared/redux/reducers';
import initialState from '../../../electron/redux/initialState';

// Create the middleware chain
const middleware = [
    thunk,
    promiseMiddleware()
];

// A reducer to set the entire state of the app
const setStateReducer = (state = {}, action) => {
    switch (action.type) {
        case 'SET_STATE':
            return action.payload;
        default:
            return state;
    }
};

const reducersWithSetState = reduceReducers(setStateReducer, reducers);

export const setState = (state) => ({
    type: 'SET_STATE',
    payload: state
});

export const store = createStore(reducersWithSetState, initialState, applyMiddleware(...middleware));
