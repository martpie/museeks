import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { getCurrent } from '@tauri-apps/api/window';
import * as semver from 'semver';

import type { Config, DefaultView } from '../generated/typings';
import config from '../lib/config';
import { themes } from '../lib/themes';
import { logAndNotifyError } from '../lib/utils';
import type { Theme } from '../types/museeks';

import router from '../views/router';
import useToastsStore from './useToastsStore';

interface UpdateCheckOptions {
  silentFail?: boolean;
}

const setTheme = async (themeID: string): Promise<void> => {
  await config.set('theme', themeID); // TODO: own plugin?
  await checkTheme();
};

/**
 * Apply theme colors to  the BrowserWindow
 */
const applyThemeToUI = async (theme: Theme): Promise<void> => {
  // TODO think about variables validity?
  // TODO: update the window theme dynamically

  const root = document.documentElement;
  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

const checkTheme = async (): Promise<void> => {
  // TODO: Tauri offers no API to query the system system preference,getCurrent().theme()
  // that is used when a window is created with no assigned theme.
  // So we are bypassing the user choice for now.
  // const themeID: string = await config.get("theme");
  const themeID = (await getCurrent().theme()) ?? 'light';
  const theme = themes[themeID];

  if (theme == null) {
    throw new Error(`Theme ${themeID} not found`);
  }

  applyThemeToUI(theme);
};

const setTracksDensity = async (
  density: Config['track_view_density'],
): Promise<void> => {
  await config.set('track_view_density', density);
  router.revalidate();
};

/**
 * Check and enable sleep blocker if needed
 */
const checkSleepBlocker = async (): Promise<void> => {
  if (await config.get('sleepblocker')) {
    invoke('plugin:sleepblocker|enable');
  }
};

/**
 * Check if a new release is available
 */
const checkForUpdate = async (
  options: UpdateCheckOptions = {},
): Promise<void> => {
  const shouldCheck = await config.get('auto_update_checker');

  if (!shouldCheck) {
    return;
  }

  const currentVersion = await getVersion();

  try {
    const response = await fetch(
      'https://api.github.com/repos/martpie/museeks/releases',
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
      message = `Museeks ${newRelease.tag_name} is available, check http://museeks.io!`;
    } else if (!options.silentFail) {
      message = `Museeks ${currentVersion} is the latest version available.`;
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
};

/**
 * Init all settings
 */
const check = async (): Promise<void> => {
  await Promise.allSettled([
    checkTheme(),
    checkSleepBlocker(),
    checkForUpdate({ silentFail: true }),
  ]);
};

/**
 * Toggle sleep blocker
 */
const toggleSleepBlocker = async (value: boolean): Promise<void> => {
  if (value === true) {
    await invoke('plugin:sleepblocker|enable');
  } else {
    await invoke('plugin:sleepblocker|disable');
  }
  router.revalidate();
};

/**
 * Set the default view of the app
 */
const setDefaultView = async (defaultView: DefaultView): Promise<void> => {
  await invoke('plugin:default-view|set', {
    defaultView,
  });
  router.revalidate();
};

/**
 * Toggle update check on startup
 */
const toggleAutoUpdateChecker = async (value: boolean): Promise<void> => {
  await config.set('auto_update_checker', value);
  router.revalidate();
};

/**
 * Toggle native notifications display
 */
const toggleDisplayNotifications = async (value: boolean): Promise<void> => {
  await config.set('notifications', value);
  router.revalidate();
};

// Should we use something else to harmonize between zustand and non-store APIs?
const SettingsAPI = {
  setTheme,
  applyThemeToUI,
  setTracksDensity,
  check,
  checkTheme,
  checkSleepBlocker,
  checkForUpdate,
  toggleSleepBlocker,
  setDefaultView,
  toggleAutoUpdateChecker,
  toggleDisplayNotifications,
};

export default SettingsAPI;
