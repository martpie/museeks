// Modules
import React, { Component } from 'react';
import { Route, IndexRoute } from 'react-router';

// Components
import App      from '../components/App.react';
import Library  from '../components/Library/Library.react';
import Settings from '../components/Settings/Settings.react';


// Router
var routes = (
    <Route component={ App } path='/'>
        <Route path='/library'  component={ Library } />
        <Route path='/settings' component={ Settings } />
    </Route>
);

export default routes;
