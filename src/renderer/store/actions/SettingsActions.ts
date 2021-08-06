import { ipcRenderer } from 'electron';
import * as semver from 'semver';

import store from '../store';
import types from '../action-types';
import channels from '../../../shared/lib/ipc-channels';
import * as app from '../../lib/app';
import { Theme } from '../../../shared/types/museeks';
import * as ToastsActions from './ToastsActions';

interface UpdateCheckOptions {
  silentFail?: boolean;
}

export const getTheme = async (): Promise<string> => {
  const themeId = await ipcRenderer.invoke(channels.THEME_GET_ID);

  return themeId;
};

export const setTheme = async (themeId: string): Promise<void> => {
  await ipcRenderer.invoke(channels.THEME_SET_ID, themeId);
};

/**
 * Apply theme colors to  the BrowserWindow
 */
export const applyThemeToUI = async (theme: Theme): Promise<void> => {
  // TODO think about variables validity?
  const root = document.documentElement;

  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

export const checkTheme = async (): Promise<void> => {
  const theme = await ipcRenderer.invoke(channels.THEME_GET);

  applyThemeToUI(theme);
};

/**
 * Check and enable sleep blocker if needed
 */
export const checkSleepBlocker = (): void => {
  if (app.config.get('sleepBlocker')) {
    ipcRenderer.send('settings:toggleSleepBlocker', true);
  }
};

/**
 * Check if a new release is available
 */
export const checkForUpdate = async (options: UpdateCheckOptions = {}): Promise<void> => {
  const currentVersion = app.version;

  try {
    const response = await fetch('https://api.github.com/repos/martpie/museeks/releases');
    const releases = await response.json();

    // TODO Github API types?
    const newRelease = releases.find(
      (release: any) => semver.valid(release.tag_name) !== null && semver.gt(release.tag_name, currentVersion)
    );

    let message;
    if (newRelease) {
      message = `Museeks ${newRelease.tag_name} is available, check http://museeks.io!`;
    } else if (!options.silentFail) {
      message = `Museeks ${currentVersion} is the latest version available.`;
    }

    if (message) {
      ToastsActions.add('success', message);
    }
  } catch (e) {
    if (!options.silentFail) ToastsActions.add('danger', 'An error occurred while checking updates.');
  }
};

/**
 * Init all settings
 */
export const check = async (): Promise<void> => {
  await checkTheme();
  checkSleepBlocker();
  if (app.config.get('autoUpdateChecker')) {
    checkForUpdate({ silentFail: true }).catch((err) => {
      console.error(err);
    });
  }
};

/**
 * Toggle sleep blocker
 */
export const toggleSleepBlocker = (value: boolean): void => {
  app.config.set('sleepBlocker', value);
  app.config.save();

  ipcRenderer.send('settings:toggleSleepBlocker', value);

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
};

/**
 * Set the default view of the app
 */
export const setDefaultView = (value: string): void => {
  app.config.set('defaultView', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
};

/**
 * Toggle update check on startup
 */
export const toggleAutoUpdateChecker = (value: boolean): void => {
  app.config.set('autoUpdateChecker', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
};

/**
 * Toggle minimize-to-tray
 */
export const toggleMinimizeToTray = (value: boolean): void => {
  app.config.set('minimizeToTray', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
};

/**
 * Toggle native notifications display
 */
export const toggleDisplayNotifications = (value: boolean): void => {
  app.config.set('displayNotifications', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
};
