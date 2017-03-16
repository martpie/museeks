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
import store from './redux/store';
import lib from './lib';

import { RpcIpcManager } from '../shared/modules/rpc'

// Start listening for RPC IPC events
const rpcIpcManager = new RpcIpcManager(lib, 'mainThread');

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

require('bootstrap-css-only/css/bootstrap.min.css');
require('font-awesome/css/font-awesome.css');
require('../styles/main.scss');

// Get the config
const config = store.getState().config;

// Config the audio player
lib.player.setAudioVolume(config.audioVolume);
lib.player.setAudioPlaybackRate(config.audioPlaybackRate);
lib.player.setAudioMuted(config.audioMuted);

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
