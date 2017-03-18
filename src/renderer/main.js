/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { Router,  hashHistory } from 'react-router';

import { Provider } from 'react-redux';

import database from './database';
import getRoutes from './router/routes';
import store from './redux/store';
import lib from './lib';
import init from './init';

import { RpcIpcManager } from 'electron-simple-rpc';

// Start listening for RPC IPC events
const rpcIpcManager = new RpcIpcManager(lib, 'mainThread');

// Init
init(store, lib);

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
