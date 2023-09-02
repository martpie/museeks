import { Outlet, useMatch, Navigate } from 'react-router-dom';

import * as Nav from '../elements/Nav/Nav';

import { LoaderData } from './router';
import appStyles from './Root.module.css';
import styles from './ViewSettings.module.css';

export default function ViewSettingsView() {
  const match = useMatch('/settings');

  return (
    <div className={`${appStyles.view} ${styles.viewSettings}`}>
      <div className={styles.settings__nav}>
        <Nav.Wrap vertical>
          <Nav.Link to="/settings/library">Library</Nav.Link>
          <Nav.Link to="/settings/audio">Audio</Nav.Link>
          <Nav.Link to="/settings/interface">Interface</Nav.Link>
          <Nav.Link to="/settings/about">About</Nav.Link>
        </Nav.Wrap>
      </div>

      <div className={styles.settings__content}>
        <Outlet />
      </div>

      {match && <Navigate to="/settings/library" />}
    </div>
  );
}

export type SettingsLoaderData = LoaderData<typeof ViewSettingsView.loader>;

ViewSettingsView.loader = async () => {
  const config = await window.MuseeksAPI.config.getAll();

  return {
    config,
  };
};
