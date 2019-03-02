import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import SettingsLibrary from './SettingsLibrary';
import SettingsUI from './SettingsUI';
import SettingsAudio from './SettingsAudio';
import SettingsAbout from './SettingsAbout';
import * as Nav from '../../elements/Nav/Nav';

import { config } from '../../lib/app';
import { LibraryState } from '../../reducers/library';
import { RootState } from '../../reducers';
import { Config } from 'src/shared/types/interfaces';

import * as styles from './Settings.css';
import * as appStyles from '../../App.css';

interface Props {
  library: LibraryState;
}

const Settings: React.FC<Props> = (props) => {
  const { library } = props;
  const conf = config.get() as Config;

  return (
    <div className={`${appStyles.view} ${styles.viewSettings}`}>
      <div className={styles.settings__nav}>
        <Nav.Wrap vertical>
          <Nav.Link to='/settings/library'>
            Library
          </Nav.Link>
          <Nav.Link to='/settings/audio'>
            Audio
          </Nav.Link>
          <Nav.Link to='/settings/interface'>
            Interface
          </Nav.Link>
          <Nav.Link to='/settings/about'>
            About
        </Nav.Link>
        </Nav.Wrap>
      </div>

      <div className={styles.settings__content}>
        <Switch>
          <Route
            path='/settings'
            exact
            render={() => (<Redirect to='/settings/library' />)}
          />
          <Route
            path='/settings/library'
            render={p => (<SettingsLibrary {...p} library={library} />)}
          />
          <Route
            path='/settings/interface'
            render={p => (<SettingsUI {...p} config={conf} />)}
          />
          <Route
            path='/settings/audio'
            render={p => (<SettingsAudio {...p} config={conf} />)}
          />
          <Route
            path='/settings/about'
            render={() => (<SettingsAbout />)}
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
