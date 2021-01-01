import React from 'react';
import { Router as ReactRouter, Switch, Route } from 'react-router-dom';

import history from './lib/history';

// Views
import App from './App';
import LibraryView from './views/Library/Library';
import PlaylistsView from './views/Playlists/Playlists';
import SettingsView from './views/Settings/Settings';

const Router: React.FC = () => (
  <ReactRouter history={history}>
    <App>
      <Switch>
        <Route path='/library' component={LibraryView} />
        <Route path='/settings' component={SettingsView} />
        <Route path='/playlists/:playlistId?' component={PlaylistsView} />
      </Switch>
    </App>
  </ReactRouter>
);

export default Router;
