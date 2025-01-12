import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { info } from '@tauri-apps/plugin-log';
import * as semver from 'semver';

import type { Config, DefaultView } from '../generated/typings';
import config from '../lib/config';
import { getTheme } from '../lib/themes';
import { logAndNotifyError } from '../lib/utils';

import useLibraryStore from './useLibraryStore';
import useToastsStore from './useToastsStore';

// Manual prevention of a useEffect being called twice (to avoid refreshing the
// library twice on startup in dev mode).
// Also, we useInvalidate, SettingsAPI.init would infinitely loop. It means
// something is fishy and need to be fixed "somewhere".
let did_init = false;

/**
 * Init all settings, then show the app
 */
async function init(then: () => void): Promise<void> {
  if (did_init) return;

  did_init = true;
  // Blocking (the window should not be shown until it's done)
  await Promise.allSettled([
    checkTheme(),
    checkForUpdate({ silentFail: true }),
  ]);

  // Show the app once everything is loaded
  await getCurrentWindow().show();
  info('UI is ready!');

  // Non-blocking, this can we done later
  await checkForLibraryRefresh().catch(logAndNotifyError);
  then();
}

const setTheme = async (themeID: string): Promise<void> => {
  await config.set('theme', themeID);

  switch (themeID) {
    case '__system': {
      await getCurrentWindow().setTheme(null);
      break;
    }
    case 'light': {
      await getCurrentWindow().setTheme('light');
      break;
    }
    case 'dark': {
      await getCurrentWindow().setTheme('dark');
      break;
    }
  }

  const theme = (await getCurrentWindow().theme()) ?? 'light';

  await applyThemeToUI(theme);
};

/**
 * Apply theme colors to  the BrowserWindow
 */
async function applyThemeToUI(themeID: string): Promise<void> {
  const theme = getTheme(themeID);

  // TODO think about variables validity?
  // TODO: update the window theme dynamically
  const root = document.documentElement;
  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

async function checkTheme(): Promise<void> {
  const theme = (await getCurrentWindow().theme()) ?? 'light';
  applyThemeToUI(theme);
}

async function setTracksDensity(
  density: Config['track_view_density'],
): Promise<void> {
  await config.set('track_view_density', density);
}

/**
 * Check if a new release is available
 */
async function checkForUpdate(
  options: { silentFail?: boolean } = {},
): Promise<void> {
  const shouldCheck = await config.get('auto_update_checker');

  if (!shouldCheck) {
    return;
  }

  const currentVersion = await getVersion();

  try {
    const response = await fetch(
      'https://api.github.com/repos/martpie/syncudio/releases',
    );

    if (!response.ok) {
      if (options.silentFail) {
        return;
      }

      throw new Error('Impossible to retrieve releases information.');
    }

    // biome-ignore lint/suspicious/noExplicitAny: ok for now
    const releases: any = await response.json();

    // TODO Github API types?
    const newRelease = releases.find(
      // biome-ignore lint/suspicious/noExplicitAny: ok for now
      (release: any) =>
        semver.valid(release.tag_name) !== null &&
        semver.gt(release.tag_name, currentVersion),
    );

    let message: string | undefined;
    if (newRelease) {
      message = `Syncudio ${newRelease.tag_name} is available, check https://syncudio.io!`;
    } else if (!options.silentFail) {
      message = `Syncudio ${currentVersion} is the latest version available.`;
    }

    if (message) {
      useToastsStore.getState().api.add('success', message);
    }
  } catch (e) {
    logAndNotifyError(
      e,
      'An error occurred while checking updates.',
      true,
      options.silentFail,
    );
  }
}

/**
 * Toggle sleep blocker
 */
async function toggleSleepBlocker(value: boolean): Promise<void> {
  if (value === true) {
    await invoke('plugin:sleepblocker|enable');
  } else {
    await invoke('plugin:sleepblocker|disable');
  }
}

/**
 * Set the default view of the app
 */
async function setDefaultView(defaultView: DefaultView): Promise<void> {
  await invoke('plugin:default-view|set', {
    defaultView,
  });
}

/**
 * Toggle library refresh on startup
 */
async function toggleLibraryAutorefresh(value: boolean): Promise<void> {
  await config.set('library_autorefresh', value);
}

async function checkForLibraryRefresh(): Promise<void> {
  const autorefreshEnabled = config.getInitial('library_autorefresh');

  if (autorefreshEnabled) {
    useLibraryStore.getState().api.refresh();
  }
}

/**
 * Toggle update check on startup
 */
async function toggleAutoUpdateChecker(value: boolean): Promise<void> {
  await config.set('auto_update_checker', value);
}

/**
 * Toggle native notifications display
 */
async function toggleDisplayNotifications(value: boolean): Promise<void> {
  await config.set('notifications', value);
}

// Should we use something else to harmonize between zustand and non-store APIs?
const SettingsAPI = {
  init,
  setTheme,
  applyThemeToUI,
  setTracksDensity,
  checkForUpdate,
  toggleSleepBlocker,
  setDefaultView,
  toggleLibraryAutorefresh,
  toggleAutoUpdateChecker,
  toggleDisplayNotifications,
};

export default SettingsAPI;
