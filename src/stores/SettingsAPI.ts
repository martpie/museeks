import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import * as semver from 'semver';

import type { Config, DefaultView } from '../generated/typings';
import config from '../lib/config';
import { getTheme } from '../lib/themes';
import { logAndNotifyError } from '../lib/utils';

import { invalidate } from '../lib/query';
import router from '../views/router';
import useToastsStore from './useToastsStore';

interface UpdateCheckOptions {
  silentFail?: boolean;
}

const setTheme = async (themeID: string): Promise<void> => {
  await config.set('theme', themeID);
  await applyThemeToUI(themeID);
  invalidate();
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
  // TODO: Tauri offers no API to query the system system preference,getCurrent().theme()
  // that is used when a window is created with no assigned theme.
  // So we are bypassing the user choice for now.
  // const themeID: string = await config.get("theme");
  const themeID = await config.get('theme');
  applyThemeToUI(themeID);
}

async function setTracksDensity(
  density: Config['track_view_density'],
): Promise<void> {
  await config.set('track_view_density', density);
  router.revalidate();
}

/**
 * Check and enable sleep blocker if needed
 */
async function checkSleepBlocker(): Promise<void> {
  if (await config.get('sleepblocker')) {
    invoke('plugin:sleepblocker|enable');
  }
}

/**
 * Check if a new release is available
 */
async function checkForUpdate(options: UpdateCheckOptions = {}): Promise<void> {
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
}

/**
 * Init all settings
 */
async function checkAllSettings(): Promise<void> {
  await Promise.allSettled([
    checkTheme(),
    checkSleepBlocker(),
    checkForUpdate({ silentFail: true }),
  ]);
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
  router.revalidate();
}

/**
 * Set the default view of the app
 */
async function setDefaultView(defaultView: DefaultView): Promise<void> {
  await invoke('plugin:default-view|set', {
    defaultView,
  });
  router.revalidate();
}

/**
 * Toggle update check on startup
 */
async function toggleAutoUpdateChecker(value: boolean): Promise<void> {
  await config.set('auto_update_checker', value);
  router.revalidate();
}

/**
 * Toggle native notifications display
 */
async function toggleDisplayNotifications(value: boolean): Promise<void> {
  await config.set('notifications', value);
  router.revalidate();
}

// Should we use something else to harmonize between zustand and non-store APIs?
const SettingsAPI = {
  setTheme,
  applyThemeToUI,
  setTracksDensity,
  checkAllSettings,
  checkForUpdate,
  toggleSleepBlocker,
  setDefaultView,
  toggleAutoUpdateChecker,
  toggleDisplayNotifications,
};

export default SettingsAPI;
