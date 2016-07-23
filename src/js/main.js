/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { Router,  hashHistory } from 'react-router';

import { Provider } from 'react-redux';

import routes from './router/routes';
import store from './store.js';


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

require('bootstrap-css-only/css/bootstrap.min.css');
require('font-awesome/css/font-awesome.css');
require('../styles/main.scss');


/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
    <Provider store={ store }>
        <Router routes={ routes } history={ hashHistory } />
    </Provider>,
    document.getElementById('wrap')
);
