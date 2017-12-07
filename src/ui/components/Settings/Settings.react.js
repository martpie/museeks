import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Switch, Route, Redirect } from 'react-router-dom';

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
    config: PropTypes.object,
    library: PropTypes.object,
    children: PropTypes.object,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { library } = this.props;
    const conf = config.getAll();

    return (
      <div className='view view-settings'>
        <div className='settings-switcher'>
          <Nav bsStyle="pills" activeKey={1} onSelect={undefined}>
            <LinkContainer to='/settings/library'>
              <NavItem eventKey={1}>Library</NavItem>
            </LinkContainer>
            <LinkContainer to='/settings/audio'>
              <NavItem eventKey={2}>Audio</NavItem>
            </LinkContainer>
            <LinkContainer to='/settings/interface'>
              <NavItem eventKey={3}>Interface</NavItem>
            </LinkContainer>
            <LinkContainer to='/settings/advanced'>
              <NavItem eventKey={4}>Advanced</NavItem>
            </LinkContainer>
            <LinkContainer to='/settings/about'>
              <NavItem eventKey={5}>About</NavItem>
            </LinkContainer>
          </Nav>
          <div className="tab-content">
            <Switch>
              <Route
                path='/settings'
                exact
                render={() => (<Redirect to='/settings/library' />)}
              />
              <Route
                path='/settings/library'
                render={(p) => (<SettingsLibrary {...p} config={conf} library={library} />)}
              />
              <Route
                path='/settings/interface'
                render={(p) => (<SettingsUI {...p} config={conf} library={library} />)}
              />
              <Route
                path='/settings/audio'
                render={(p) => (<SettingsAudio {...p} config={conf} library={library} />)}
              />
              <Route
                path='/settings/advanced'
                render={(p) => (<SettingsAdvanced {...p} config={conf} library={library} />)}
              />
              <Route
                path='/settings/about'
                render={(p) => (<SettingsAbout {...p} config={conf} library={library} />)}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (({ library }) => ({ library }));

export default connect(mapStateToProps)(Settings);
