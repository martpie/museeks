import * as semver from 'semver';

import channels from '../../shared/lib/ipc-channels';
import { Theme } from '../../shared/types/museeks';
import logger from '../../shared/lib/logger';

import useToastsStore from './useToastsStore';

const { ipcRenderer } = window.ElectronAPI;

interface UpdateCheckOptions {
  silentFail?: boolean;
}

const getTheme = async (): Promise<string> => {
  const themeId = await ipcRenderer.invoke(channels.THEME_GET_ID);

  return themeId;
};

const setTheme = async (themeId: string): Promise<void> => {
  await ipcRenderer.invoke(channels.THEME_SET_ID, themeId);
};

/**
 * Apply theme colors to  the BrowserWindow
 */
const applyThemeToUI = async (theme: Theme): Promise<void> => {
  // TODO think about variables validity?
  const root = document.documentElement;

  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

const checkTheme = async (): Promise<void> => {
  const theme = await ipcRenderer.invoke(channels.THEME_GET);

  applyThemeToUI(theme);
};

/**
 * Check and enable sleep blocker if needed
 */
const checkSleepBlocker = (): void => {
  if (window.MuseeksAPI.config.get('sleepBlocker')) {
    ipcRenderer.send('settings:toggleSleepBlocker', true);
  }
};

/**
 * Check if a new release is available
 */
const checkForUpdate = async (
  options: UpdateCheckOptions = {},
): Promise<void> => {
  const currentVersion = window.MuseeksAPI.version;

  try {
    const response = await fetch(
      'https://api.github.com/repos/martpie/museeks/releases',
    );
    const releases = await response.json();

    // TODO Github API types?
    const newRelease = releases.find(
      (release: any) =>
        semver.valid(release.tag_name) !== null &&
        semver.gt(release.tag_name, currentVersion),
    );

    let message;
    if (newRelease) {
      message = `Museeks ${newRelease.tag_name} is available, check http://museeks.io!`;
    } else if (!options.silentFail) {
      message = `Museeks ${currentVersion} is the latest version available.`;
    }

    if (message) {
      useToastsStore.getState().api.add('success', message);
    }
  } catch (e) {
    if (!options.silentFail)
      useToastsStore
        .getState()
        .api.add('danger', 'An error occurred while checking updates.');
  }
};

/**
 * Init all settings
 */
const check = async (): Promise<void> => {
  await checkTheme();
  checkSleepBlocker();
  if (window.MuseeksAPI.config.get('autoUpdateChecker')) {
    checkForUpdate({ silentFail: true }).catch((err) => {
      logger.error(err);
    });
  }
};

/**
 * Toggle sleep blocker
 */
const toggleSleepBlocker = (value: boolean): void => {
  window.MuseeksAPI.config.set('sleepBlocker', value);
  window.MuseeksAPI.config.save();

  ipcRenderer.send('settings:toggleSleepBlocker', value);
};

/**
 * Set the default view of the app
 */
const setDefaultView = (value: string): void => {
  window.MuseeksAPI.config.set('defaultView', value);
  window.MuseeksAPI.config.save();
};

/**
 * Toggle update check on startup
 */
const toggleAutoUpdateChecker = (value: boolean): void => {
  window.MuseeksAPI.config.set('autoUpdateChecker', value);
  window.MuseeksAPI.config.save();
};

/**
 * Toggle minimize-to-tray
 */
const toggleMinimizeToTray = (value: boolean): void => {
  window.MuseeksAPI.config.set('minimizeToTray', value);
  window.MuseeksAPI.config.save();
};

/**
 * Toggle native notifications display
 */
const toggleDisplayNotifications = (value: boolean): void => {
  window.MuseeksAPI.config.set('displayNotifications', value);
  window.MuseeksAPI.config.save();
};

// Should we use something else to harmonize between zustand and non-store APIs?
const SettingsAPI = {
  getTheme,
  setTheme,
  applyThemeToUI,
  check,
  checkTheme,
  checkSleepBlocker,
  checkForUpdate,
  toggleSleepBlocker,
  setDefaultView,
  toggleAutoUpdateChecker,
  toggleMinimizeToTray,
  toggleDisplayNotifications,
};

export default SettingsAPI;
