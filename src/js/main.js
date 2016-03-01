/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React    from 'react';
import ReactDOM from 'react-dom';
import { Router,  hashHistory } from 'react-router';

import routes from './router/routes';



/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

require('../styles/main.scss');



/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
    <Router routes={ routes } history={ hashHistory } />,
    document.getElementById('wrap')
);
