import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom';

// History
import history from './history';

// Views
import App from '../elements/App';
import Library from '../elements/Library/Library';
import Playlists from '../elements/Playlists/Playlists';
import Settings from '../elements/Settings/Settings';

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
