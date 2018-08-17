/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import ReactDOM from 'react-dom';
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
