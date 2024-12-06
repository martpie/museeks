import { createFileRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';

import * as SettingNav from '../elements/SettingsNav';
import View from '../elements/View';
import config from '../lib/config';

import styles from './settings._layout.module.css';

export const Route = createFileRoute('/settings/_layout')({
  component: SettingsLayout,
});

function SettingsLayout() {
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
    </View>
  );
}

export async function loader() {
  return {
    config: await config.getAll(),
    version: await getVersion(),
    tauriVersion: await getTauriVersion(),
    appStorageDir: await invoke<string>('plugin:config|get_storage_dir'),
  };
}
