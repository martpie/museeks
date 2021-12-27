import React from 'react';
import { Outlet, useMatch } from 'react-router';
import { Navigate } from 'react-router-dom';

import * as Nav from '../../elements/Nav/Nav';
import appStyles from '../../App.module.css';

import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const match = useMatch('/settings');

  if (match) {
    return <Navigate to='/settings/library' />;
  }

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
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
