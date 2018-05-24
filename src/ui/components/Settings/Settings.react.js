import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';

import SettingsLibrary from './SettingsLibrary.react';
import SettingsUI from './SettingsUI.react';
import SettingsAudio from './SettingsAudio.react';
import SettingsAdvanced from './SettingsAdvanced.react';
import SettingsAbout from './SettingsAbout.react';

import { config } from '../../lib/app';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

class Settings extends Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
  }

  render() {
    const { library } = this.props;
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
              render={p => (<SettingsLibrary {...p} config={conf} library={library} />)}
            />
            <Route
              path="/settings/interface"
              render={p => (<SettingsUI {...p} config={conf} library={library} />)}
            />
            <Route
              path="/settings/audio"
              render={p => (<SettingsAudio {...p} config={conf} library={library} />)}
            />
            <Route
              path="/settings/advanced"
              render={p => (<SettingsAdvanced {...p} config={conf} library={library} />)}
            />
            <Route
              path="/settings/about"
              render={p => (<SettingsAbout {...p} config={conf} library={library} />)}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (({ library }) => ({ library }));

export default connect(mapStateToProps)(Settings);
