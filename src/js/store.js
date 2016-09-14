import { createStore } from 'redux';

import reducer from './reducers/index';
import initialState from './reducers/initial-state';

const store = createStore(reducer, initialState);

export default store;
