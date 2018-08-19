/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Router from './router/Router';
import store from './store';


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

import './styles/main.scss';


/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  document.getElementById('wrap'),
);
