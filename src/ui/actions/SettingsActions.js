import electron from 'electron';
import semver from 'semver';

import store from '../store.js';
import types  from '../constants/action-types';
import AppActions from './AppActions';
import * as ToastsActions from './ToastsActions';

import * as app from '../lib/app';

import { IPCR_TOGGLE_SLEEPBLOCKER } from '../../shared/constants/ipc';


const { ipcRenderer } = electron;


/**
 * Init all settings
 */
export const check = () => {
  checkTheme();
  checkDevMode();
  checkSleepBlocker();
  if(app.config.get('autoUpdateChecker')) checkForUpdate({ silentFail: true });
};

const checkTheme = () => {
  const themeName = app.config.get('theme');
  document.querySelector('body').classList.add(`theme-${themeName}`);
};

/**
 * Toggle dark/light theme
 * @param {String} value 'light' or 'dark'
 */
export const toggleDarkTheme = (value) => {
  const oldTheme = value ? 'light' : 'dark';
  const newTheme = value ? 'dark' : 'light';

  document.querySelector('body').classList.remove(`theme-${oldTheme}`);
  document.querySelector('body').classList.add(`theme-${newTheme}`);

  app.config.set('theme', newTheme);
  app.config.saveSync();

  store.dispatch({
    type : types.APP_REFRESH_CONFIG,
  });
};

/**
 * Toggle sleep blocker
 * @param {Boolean} value
 */
export const toggleSleepBlocker = (value) => {
  app.config.set('sleepBlocker', value);
  app.config.saveSync();

  ipcRenderer.send(IPCR_TOGGLE_SLEEPBLOCKER, value, 'prevent-app-suspension');

  store.dispatch({
    type : types.APP_REFRESH_CONFIG,
  });
};

/**
 * Check and enable sleep blocker if needed
 */
export const checkSleepBlocker = () => {
  if(app.config.get('sleepBlocker')) {
    ipcRenderer.send(IPCR_TOGGLE_SLEEPBLOCKER, true, 'prevent-app-suspension');
  }
};

/**
 * Toggle dev mode (show/hide dev tools)
 * @param {Boolean} value
 */
export const toggleDevMode = (value) => {
  app.config.set('devMode', value);

  // Open dev tools if needed
  if(value) app.browserWindows.main.webContents.openDevTools();
  else app.browserWindows.main.webContents.closeDevTools();

  app.config.saveSync();

  store.dispatch({
    type : types.APP_REFRESH_CONFIG,
  });
};

/**
 * Check and enable dev mode if needed
 */
export const checkDevMode = () => {
  if(app.config.get('devMode')) app.browserWindows.main.webContents.openDevTools();
};

/**
 * Toggle update check on startup
 * @param {Boolean} value
 */
export const toggleAutoUpdateChecker = (value) => {
  app.config.set('autoUpdateChecker', value);
  app.config.saveSync();

  store.dispatch({
    type : types.APP_REFRESH_CONFIG,
  });
};

/**
 * Check if a new release is available
 * @param {Object} [options={}]
 */
const checkForUpdate = async (options = {}) => {
  const currentVersion = app.version;

  try {
    const response = await fetch('https://api.github.com/repos/KeitIG/museeks/releases');
    const releases = await response.json();

    const newRelease = releases.find((release) => {
      return semver.valid(release.tag_name) !== null && semver.gt(release.tag_name, currentVersion);
    });

    let message;
    if (newRelease) {
      message = `Museeks ${newRelease.tag_name} is available, check http://museeks.io!`;
    } else if(!options.silentFail) {
      message = `Museeks ${currentVersion} is the latest version available.`;
    }

    if (message) {
      ToastsActions.add('success', message);
    }
  } catch (e) {
    if(!options.silentFail) ToastsActions.add('danger', 'An error occurred while checking updates.');
  }
};

/**
 * Toggle native frame
 * @param {Boolean} value
 */
export const toggleNativeFrame = (value) => {
  app.config.set('useNativeFrame', value);
  app.config.saveSync();
  AppActions.restart();
};

/**
 * Toggle minimize-to-tray
 * @param {Boolean} value
 */
export const toggleMinimizeToTray = (value) => {
  app.config.set('minimizeToTray', value);
  app.config.saveSync();

  store.dispatch({
    type : types.APP_REFRESH_CONFIG,
  });
};

/**
 * Toggle native notifications display
 * @param {Boolean} value
 */
export const toggleDisplayNotifications = (value) => {
  app.config.set('displayNotifications', value);
  app.config.saveSync();

  store.dispatch({
    type : types.APP_REFRESH_CONFIG,
  });
};
