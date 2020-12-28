import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Config } from '../../../shared/types/museeks';
import * as Nav from '../../elements/Nav/Nav';
import { config } from '../../lib/app';
import { RootState } from '../../reducers';
import appStyles from '../../App.module.css';
import SettingsLibrary from './SettingsLibrary';
import SettingsUI from './SettingsUI';
import SettingsAudio from './SettingsAudio';
import SettingsAbout from './SettingsAbout';

import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const library = useSelector((state: RootState) => state.library);
  const conf = config.get() as Config;

  return (
    <div className={`${appStyles.view} ${styles.viewSettings}`}>
      <div className={styles.settings__nav}>
        <Nav.Wrap vertical>
          <Nav.Link to='/settings/library'>Library</Nav.Link>
          <Nav.Link to='/settings/audio'>Audio</Nav.Link>
          <Nav.Link to='/settings/interface'>Interface</Nav.Link>
          <Nav.Link to='/settings/about'>About</Nav.Link>
        </Nav.Wrap>
      </div>

      <div className={styles.settings__content}>
        <Switch>
          <Route path='/settings' exact render={() => <Redirect to='/settings/library' />} />
          <Route path='/settings/library' render={(p) => <SettingsLibrary {...p} library={library} />} />
          <Route path='/settings/interface' render={(p) => <SettingsUI {...p} config={conf} />} />
          <Route path='/settings/audio' render={(p) => <SettingsAudio {...p} config={conf} />} />
          <Route path='/settings/about' render={() => <SettingsAbout />} />
        </Switch>
      </div>
    </div>
  );
};

export default Settings;
