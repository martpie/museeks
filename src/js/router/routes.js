// Modules
import React, { Component } from 'react';
import { Route, IndexRoute } from 'react-router';

// Actions
import AppActions from '../actions/AppActions';

// Components
import App       from '../components/App.react';
import Library   from '../components/Library/Library.react';
import Settings  from '../components/Settings/Settings.react';
import Playlists from '../components/Playlists/Playlists.react';
import Playlist  from '../components/Playlists/Playlist.react';
import PlaylistSplash from '../components/Playlists/PlaylistSplash.react';

let init = {

    app: (route) => {
        AppActions.init();
    },

    library: (route) => {
        AppActions.library.load();
    },

    playlist: (route) => {
        AppActions.playlists.load(route.params.id);
    }
};

// Router
let routes = (
    <Route component={ App } path='/' onEnter={ init.app }>
        <Route path='library'   component={ Library } onEnter={ init.library } />
        <Route path='settings'  component={ Settings } />
        <Route path='playlists' component={ Playlists }>
            <IndexRoute component={ PlaylistSplash } />
            <Route path=':id' component={ Playlist } onEnter={ init.playlist }/>
        </Route>
    </Route>
);



export default routes;
