import { createStore } from 'redux';

import reducers from './reducers/reducers';
import initialState from './reducers/initial-state';

const store = createStore(reducers, initialState);

export default store;
