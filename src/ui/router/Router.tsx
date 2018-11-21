import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom';

// History
import history from './history';

// Components
import App from '../components/App';
import Library from '../components/Library/Library';
import Playlists from '../components/Playlists/Playlists';
import Settings from '../components/Settings/Settings';

const AppRouter: React.FunctionComponent<{}> = () => (
  <Router history={history}>
    <App>
      <Switch>
        <Route path='/library' component={Library} />
        <Route path='/settings' component={Settings} />
        <Route path='/playlists' component={Playlists} />
      </Switch>
    </App>
  </Router>
);

export default AppRouter;
