/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import ReactDOM from 'react-dom';
import Router from './router/Router';

import { Provider } from 'react-redux';

import store from './store.js';


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

import 'bootstrap-css-only/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.css';
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
