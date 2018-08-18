import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';

import SettingsLibrary from './SettingsLibrary';
import SettingsUI from './SettingsUI';
import SettingsAudio from './SettingsAudio';
import SettingsAdvanced from './SettingsAdvanced';
import SettingsAbout from './SettingsAbout';

import { config } from '../../lib/app';
import { LibraryState } from '../../reducers/library';
import { RootState } from '../../reducers';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

interface Props {
  library: LibraryState
}

const Settings: React.SFC<Props> = (props) => {
  const { library } = props;
  const conf = config.getAll();

  return (
    <div className="view view-settings">
      <nav className="settings-menu">
        <NavLink to="/settings/library" className="settings-link" activeClassName="active">
          Library
          </NavLink>
        <NavLink to="/settings/audio" className="settings-link" activeClassName="active">
          Audio
          </NavLink>
        <NavLink to="/settings/interface" className="settings-link" activeClassName="active">
          Interface
          </NavLink>
        <NavLink to="/settings/advanced" className="settings-link" activeClassName="active">
          Advanced
          </NavLink>
        <NavLink to="/settings/about" className="settings-link" activeClassName="active">
          About
          </NavLink>
      </nav>

      <div className="settings-content">
        <Switch>
          <Route
            path="/settings"
            exact
            render={() => (<Redirect to="/settings/library" />)}
          />
          <Route
            path="/settings/library"
            render={p => (<SettingsLibrary {...p} library={library} />)}
          />
          <Route
            path="/settings/interface"
            render={p => (<SettingsUI {...p} config={conf} />)}
          />
          <Route
            path="/settings/audio"
            render={p => (<SettingsAudio {...p} config={conf} />)}
          />
          <Route
            path="/settings/advanced"
            render={p => (<SettingsAdvanced {...p} config={conf} />)}
          />
          <Route
            path="/settings/about"
            render={p => (<SettingsAbout {...p} />)}
          />
        </Switch>
      </div>
    </div>
  );
};

const mapStateToProps = ((state: RootState) => ({
  library: state.library
}));

export default connect(mapStateToProps)(Settings);
