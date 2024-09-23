import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { Navigate, Outlet, useMatch } from 'react-router-dom';

import * as SettingNav from '../elements/SettingsNav/SettingsNav';
import config from '../lib/config';

import appStyles from './Root.module.css';
import styles from './ViewSettings.module.css';
import type { LoaderData } from './router';

export default function ViewSettingsView() {
  const match = useMatch('/settings');

  return (
    <div className={`${appStyles.view} ${styles.viewSettings}`}>
      <div className={styles.settings__nav}>
        <SettingNav.Wrap vertical>
          <SettingNav.Link to="/settings/library">Library</SettingNav.Link>
          <SettingNav.Link to="/settings/audio">Audio</SettingNav.Link>
          <SettingNav.Link to="/settings/interface">Interface</SettingNav.Link>
          <SettingNav.Link to="/settings/about">About</SettingNav.Link>
        </SettingNav.Wrap>
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
  return {
    config: await config.getAll(),
    version: await getVersion(),
    tauriVersion: await getTauriVersion(),
    appStorageDir: await invoke<string>('plugin:config|get_storage_dir'),
  };
};
