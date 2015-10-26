/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React    from 'react';
import ReactDOM from 'react-dom';
import Router   from 'react-router';

import routes from './router/routes';



/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

var defaultConfig = {
    theme: 'light',
    musicFolders: []
}

if(localStorage.getItem('config') === null) {
    localStorage.setItem('config', JSON.stringify(defaultConfig));
}



/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

var style = require('../styles/main.scss');



/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
    <Router routes={ routes } />,
    document.getElementById('wrap')
);
