import { Trans } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';

import { SettingsNav, SettingsNavLink } from '../elements/SettingsNav';
import View from '../elements/View';
import ConfigBridge from '../lib/bridge-config';

export const Route = createFileRoute('/settings')({
  component: ViewSettings,
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/settings') {
      throw redirect({ to: '/settings/library' });
    }
  },
  async loader() {
    const [configContent, version, tauriVersion, appStorageDir] =
      await Promise.all([
        ConfigBridge.getAll(),
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
      <div sx={styles.nav}>
        <SettingsNav>
          <SettingsNavLink to="/settings/library">
            <Trans>Library</Trans>
          </SettingsNavLink>
          <SettingsNavLink to="/settings/audio">
            <Trans>Audio</Trans>
          </SettingsNavLink>
          <SettingsNavLink to="/settings/ui">
            <Trans>Interface</Trans>
          </SettingsNavLink>
          <SettingsNavLink to="/settings/about">
            <Trans>About</Trans>
          </SettingsNavLink>
        </SettingsNav>
      </div>

      <Outlet />
    </View>
  );
}

const styles = stylex.create({
  nav: {
    position: 'absolute',
    right: '100%',
    marginRight: '60px',
  },
});
