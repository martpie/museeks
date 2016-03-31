// Modules
import React, { Component } from 'react';
import { Route, IndexRoute } from 'react-router';

// Components
import App       from '../components/App.react';
import Library   from '../components/Library/Library.react';
import Settings  from '../components/Settings/Settings.react';
import Playlists from '../components/Playlists/Playlists.react';
import Playlist  from '../components/Playlists/Playlist.react';
import PlaylistSplash from '../components/Playlists/PlaylistSplash.react';


// Router
var routes = (
    <Route component={ App } path='/'>
        <Route path='library'   component={ Library } />
        <Route path='settings'  component={ Settings } />
        <Route path='playlists' component={ Playlists }>
            <IndexRoute component={ PlaylistSplash } />
            <Route path=':id' component={ Playlist } />
        </Route>
    </Route>
);

export default routes;
