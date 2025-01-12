import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { Navigate, Outlet, useMatch } from 'react-router';

import * as SettingNav from '../elements/SettingsNav';
import View from '../elements/View';
import config from '../lib/config';
import type { LoaderData } from '../types/syncudio';

import styles from './settings.module.css';

export default function ViewSettingsView() {
  const match = useMatch('/settings');

  return (
    <View hasPadding layout="centered">
      <div className={styles.settingsNav}>
        <SettingNav.Wrap vertical>
          <SettingNav.Link to="/settings/library">Library</SettingNav.Link>
          <SettingNav.Link to="/settings/audio">Audio</SettingNav.Link>
          <SettingNav.Link to="/settings/interface">Interface</SettingNav.Link>
          <SettingNav.Link to="/settings/about">About</SettingNav.Link>
        </SettingNav.Wrap>
      </div>

      <div className={styles.settingsContent}>
        <Outlet />
      </div>

      {match && <Navigate to="/settings/library" />}
    </View>
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
