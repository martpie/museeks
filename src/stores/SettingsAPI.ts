import { t } from '@lingui/core/macro';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { info } from '@tauri-apps/plugin-log';
import * as semver from 'semver';

import type { Config, DefaultView } from '../generated/typings';
import config from '../lib/config';
import { loadTranslation } from '../lib/i18n';
import { getTheme } from '../lib/themes';
import { logAndNotifyError } from '../lib/utils';
import useLibraryStore from './useLibraryStore';
import usePlayerStore from './usePlayerStore';
import useToastsStore from './useToastsStore';

export const DEFAULT_MAIN_COLOR = '#459ce7';

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
  const [theme, color] = await Promise.all([
    getCurrentWindow()
      .theme()
      .then((maybeTheme) => maybeTheme ?? 'light'),
    config
      .get('ui_accent_color')
      .then((maybeColor) => maybeColor ?? DEFAULT_MAIN_COLOR),
    checkForUpdate({ silentFail: true }),
  ]);

  applyThemeToUI(theme);
  applyUIMainColorToUI(color);

  // Show the app once everything is loaded
  await getCurrentWindow().show();
  info('UI is ready!');

  // Non-blocking, this can we done later
  await checkForLibraryRefresh().catch(logAndNotifyError);

  // Check if we should start a queue (maybe put that somewhere else)
  const initialQueue = window.__MUSEEKS_INITIAL_QUEUE;
  if (initialQueue !== null && initialQueue.length > 0) {
    info(
      `Starting queue from file associations (${initialQueue.length} tracks)`,
    );
    usePlayerStore.getState().api.start(initialQueue, initialQueue[0].id, {
      type: 'file_associations',
    });
  }

  then();
}

const setLanguage = async (language: Config['language']): Promise<void> => {
  await loadTranslation(language);
  await config.set('language', language);
};

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
function applyThemeToUI(themeID: string): void {
  const theme = getTheme(themeID);

  // TODO think about variables validity?
  // TODO: update the window theme dynamically
  const root = document.documentElement;
  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

async function setTracksDensity(
  density: Config['track_view_density'],
): Promise<void> {
  await config.set('track_view_density', density);
}

const setUIMainColor = async (
  mainColor: Config['ui_accent_color'],
): Promise<void> => {
  await config.set('ui_accent_color', mainColor);
};

const applyUIMainColorToUI = (mainColor: Config['ui_accent_color']) => {
  document.documentElement.style.setProperty('--main-color', mainColor);

  //   --main-color: #459ce7;
  // --main-color-darker: #3a73a4;
  // --main-color-lighter: #63aff0;
  // --link-color: #459ce7;
  // --link-color-hover: #52afff;
};

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
      message = t`Museeks ${newRelease.tag_name} is available, check https://museeks.io!`;
    } else if (!options.silentFail) {
      message = t`Museeks ${currentVersion} is the latest version available.`;
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
    useLibraryStore.getState().api.scan();
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

/**
 * Toggle follow track on track change
 */
async function toggleFollowPlayingTrack(value: boolean): Promise<void> {
  await config.set('audio_follow_playing_track', value);
}

// Should we use something else to harmonize between zustand and non-store APIs?
const SettingsAPI = {
  init,
  setLanguage,
  setTheme,
  applyThemeToUI,
  setUIMainColor,
  applyUIMainColorToUI,
  setTracksDensity,
  checkForUpdate,
  toggleSleepBlocker,
  setDefaultView,
  toggleLibraryAutorefresh,
  toggleAutoUpdateChecker,
  toggleDisplayNotifications,
  toggleFollowPlayingTrack,
};

export default SettingsAPI;
