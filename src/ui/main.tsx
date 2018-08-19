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
| Some security things
|--------------------------------------------------------------------------
*/

// @ts-ignore
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`);
};

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  document.getElementById('wrap')
);
