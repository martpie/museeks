/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Root from './Root';
import Router from './router/Router';
import store from './store/store';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import 'react-rangeslider/lib/index.css';
import './styles/main.module.css';

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
  <Root>
    <Provider store={store}>
      <Router />
    </Provider>
  </Root>,
  document.getElementById('wrap')
);
