import * as electron from 'electron';
import * as semver from 'semver';

import store from '../store';
import types from '../constants/action-types';
import * as ToastsActions from './ToastsActions';

import * as app from '../lib/app';
import { Theme } from 'src/shared/types/interfaces';

const { ipcRenderer } = electron;
const darkTheme: Theme = require('../styles/themes/dark.json');
const lightTheme: Theme = require('../styles/themes/light.json');

type UpdateCheckOptions = {
  silentFail?: boolean
};

/**
 * Apply theme
 */
export const applyTheme = (theme: Theme) => {
  // TODO think about variables validity
  const root = document.documentElement;

  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

export const checkTheme = () => {
  const themeName = app.config.get('theme');

  applyTheme(themeName === 'dark' ? darkTheme : lightTheme);
};

/**
 * Check and enable sleep blocker if needed
 */
export const checkSleepBlocker = () => {
  if (app.config.get('sleepBlocker')) {
    ipcRenderer.send('settings:toggleSleepBlocker', true);
  }
};

/**
 * Check if a new release is available
 */
export const checkForUpdate = async (options: UpdateCheckOptions = {}) => {
  const currentVersion = app.version;

  try {
    const response = await fetch('https://api.github.com/repos/martpie/museeks/releases');
    const releases = await response.json();

    // TODO Github API types?
    const newRelease = releases.find((release: any) => semver.valid(release.tag_name) !== null && semver.gt(release.tag_name, currentVersion));

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
export const check = async () => {
  checkTheme();
  checkSleepBlocker();
  if (app.config.get('autoUpdateChecker')) {
    checkForUpdate({ silentFail: true }).catch((err) => {
      console.error(err);
    });
  }
};

/**
 * Toggle dark/light theme
 */
export const toggleDarkTheme = (value: boolean) => {
  const newTheme = value ? 'dark' : 'light';

  if (newTheme === 'dark') {
    applyTheme(darkTheme);
  } else {
    applyTheme(lightTheme);
  }

  app.config.set('theme', newTheme);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};

/**
 * Toggle sleep blocker
 */
export const toggleSleepBlocker = (value: boolean) => {
  app.config.set('sleepBlocker', value);
  app.config.save();

  ipcRenderer.send('settings:toggleSleepBlocker', value);

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};

/**
 * Toggle update check on startup
 */
export const toggleAutoUpdateChecker = (value: boolean) => {
  app.config.set('autoUpdateChecker', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};

/**
 * Toggle minimize-to-tray
 */
export const toggleMinimizeToTray = (value: boolean) => {
  app.config.set('minimizeToTray', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};

/**
 * Toggle native notifications display
 */
export const toggleDisplayNotifications = (value: boolean) => {
  app.config.set('displayNotifications', value);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};
