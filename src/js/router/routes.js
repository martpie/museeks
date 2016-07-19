// Modules
import React from 'react';
import { Route } from 'react-router';

// Actions
import AppActions from '../actions/AppActions';

// Components
import App       from '../components/App.react';
import Library   from '../components/Library/Library.react';
import Settings  from '../components/Settings/Settings.react';
import Playlists from '../components/Playlists/Playlists.react';
import Playlist  from '../components/Playlists/Playlist.react';

const init = {

    app: () => {
        AppActions.init();
    },

    library: () => {
        AppActions.library.setTracksCursor('all');
    },

    playlist: (route) => {
        AppActions.playlists.load(route.params.id);
        AppActions.library.setTracksCursor('playlist');
    }
};

// Router
const routes = (
    <Route component={ App } path='/' onEnter={ init.app }>
        <Route path='library' component={ Library } onEnter={ init.library } />
        <Route path='settings' component={ Settings } />
        <Route path='playlists' component={ Playlists }>
            <Route path=':id' component={ Playlist } onEnter={ init.playlist } />
        </Route>
    </Route>
);


export default routes;
