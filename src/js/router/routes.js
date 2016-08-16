// Modules
import React from 'react';
import { Route, IndexRedirect } from 'react-router';

// Actions
import AppActions from '../actions/AppActions';

// Components
import App       from '../components/App.react';
import Library   from '../components/Library/Library.react';
import Playlists from '../components/Playlists/Playlists.react';
import Playlist  from '../components/Playlists/Playlist.react';
import Settings  from '../components/Settings/Settings.react';

import SettingsLibrary  from '../components/Settings/SettingsLibrary.react';
import SettingsUI       from '../components/Settings/SettingsUI.react';
import SettingsAudio    from '../components/Settings/SettingsAudio.react';
import SettingsAdvanced from '../components/Settings/SettingsAdvanced.react';
import SettingsAbout    from '../components/Settings/SettingsAbout.react';


const init = {

    app: () => {
        AppActions.init();
    },

    library: () => {
        AppActions.library.setTracksCursor('library');
    },

    playlist: (route) => {
        AppActions.playlists.load(route.params.playlistId);
        AppActions.library.setTracksCursor('playlist');
    }
};

// Router
const routes = (
    <Route component={ App } path='/' onEnter={ init.app }>
        <Route path='library' component={ Library } onEnter={ init.library } />
        <Route path='settings' component={ Settings }>
            <IndexRedirect to="library" />
            <Route path='about' component={ SettingsAbout } />
            <Route path='advanced' component={ SettingsAdvanced } />
            <Route path='audio' component={ SettingsAudio } />
            <Route path='interface' component={ SettingsUI } />
            <Route path='library' component={ SettingsLibrary } />
        </Route>
        <Route path='playlists' component={ Playlists }>
            <Route path=':playlistId' component={ Playlist } onEnter={ init.playlist } />
        </Route>
    </Route>
);


export default routes;
