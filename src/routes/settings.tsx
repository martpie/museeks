import { Outlet, createFileRoute } from '@tanstack/react-router';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';

import { SettingsNav, SettingsNavLink } from '../elements/SettingsNav';
import View from '../elements/View';
import config from '../lib/config';

import styles from './settings.module.css';

export const Route = createFileRoute('/settings')({
  component: ViewSettings,
  loader: async function loader() {
    const [configContent, version, tauriVersion, appStorageDir] =
      await Promise.all([
        config.getAll(),
        getVersion(),
        getTauriVersion(),
        invoke<string>('plugin:config|get_storage_dir'),
      ]);

    return {
      config: configContent,
      version,
      tauriVersion,
      appStorageDir,
    };
  },
});

function ViewSettings() {
  return (
    <View hasPadding layout="centered">
      <div className={styles.settingsNav}>
        <SettingsNav>
          <SettingsNavLink to="/settings/library">Library</SettingsNavLink>
          <SettingsNavLink to="/settings/audio">Audio</SettingsNavLink>
          <SettingsNavLink to="/settings/ui">Interface</SettingsNavLink>
          <SettingsNavLink to="/settings/about">About</SettingsNavLink>
        </SettingsNav>
      </div>

      <div className={styles.settingsContent}>
        <Outlet />
      </div>
    </View>
  );
}
