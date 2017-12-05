import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

// Components
import App from '../components/App.react';
import Library from '../components/Library/Library.react';
import Playlists from '../components/Playlists/Playlists.react';
import Settings from '../components/Settings/Settings.react';


const Router = () => (
  <HashRouter>
    <App>
      <Switch>
        <Route path='/library' component={Library} />
        <Route path='/settings' component={Settings} />
        <Route path='/playlists' component={Playlists} />
      </Switch>
    </App>
  </HashRouter>
);

export default Router;
