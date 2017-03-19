/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { Router,  hashHistory } from 'react-router';

import { Provider } from 'react-redux';

import getRoutes from './router/routes';
import store from './redux/store';
import lib from './lib';
import initRenderer from './init';

import { RpcIpcManager } from 'electron-simple-rpc';

// initialize shared libraries
lib.attachStore(store);

// Start listening for RPC IPC events
const rpcIpcManager = new RpcIpcManager(lib, 'electron');

// Init renderer
initRenderer(lib);

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
        <Router routes={ getRoutes(store) } history={ hashHistory } />
    </Provider>,
    document.getElementById('wrap')
);
