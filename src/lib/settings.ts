import { t } from '@lingui/core/macro';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { info } from '@tauri-apps/plugin-log';
import { EventEmitter } from 'eventemitter3';
import { useSyncExternalStore } from 'react';
import * as semver from 'semver';

import type { Config } from '../generated/typings';
import { loadTranslation } from './i18n';
import { getTheme } from './themes';
import { logAndNotifyError } from './utils';
import useLibraryStore from '../stores/useLibraryStore';
import usePlayerStore from '../stores/usePlayerStore';
import useToastsStore from '../stores/useToastsStore';

export const DEFAULT_MAIN_COLOR = '#459ce7';

/**
 * Unified Settings module that handles:
 * - Tauri backend communication (config read/write)
 * - System-level operations (menu, sleep blocker, etc.)
 * - UI operations (theme, language, colors)
 * - React integration via useSyncExternalStore
 */
class SettingsManager extends EventEmitter {
  private config: Config | null = null;
  private initialized = false;

  // ======================
  // Core Config Operations
  // ======================

  /**
   * Get the initial value of the config at the time of instantiation.
   * Should only be used when starting the app.
   */
  getInitial<T extends keyof Config>(key: T): Config[T] {
    if (window.__MUSEEKS_INITIAL_CONFIG === undefined) {
      throw new Error('Config has not been injected from the back-end');
    }

    return window.__MUSEEKS_INITIAL_CONFIG[key];
  }

  async getAll(): Promise<Config> {
    const config: Config = await invoke('plugin:config|get_config');
    this.config = config;
    this.emit('change');
    return config;
  }

  async get<T extends keyof Config>(key: T): Promise<Config[T]> {
    const config = await this.getAll();
    return config[key];
  }

  async set<T extends keyof Config>(key: T, value: Config[T]): Promise<void> {
    const config = await this.getAll();
    config[key] = value;

    try {
      await invoke<void>('plugin:config|set_config', { config });
      this.config = config;
      this.emit('change');
    } catch (err) {
      logAndNotifyError(err);
    }
  }

  // ======================
  // React Integration
  // ======================

  getSnapshot = (): Config | null => this.config;

  subscribe = (callback: () => void) => {
    this.on('change', callback);
    return () => this.off('change', callback);
  };

  // ======================
  // App Initialization
  // ======================

  async init(then: () => void): Promise<void> {
    if (this.initialized) {
      then();
      return;
    }

    this.initialized = true;

    // Load initial config
    this.config = await this.getAll();

    // Blocking (the window should not be shown until it's done)
    const [theme, color] = await Promise.all([
      getCurrentWindow()
        .theme()
        .then((maybeTheme) => maybeTheme ?? 'light'),
      this.config?.ui_accent_color ?? DEFAULT_MAIN_COLOR,
    ]);

    this.applyThemeToUI(theme);
    this.applyUIMainColorToUI(color);

    // Show the app once everything is loaded
    await getCurrentWindow().show();
    info('UI is ready!');

    // Non-blocking, these can be done later
    this.checkForLibraryRefresh().catch(logAndNotifyError);
    this.checkForUpdate({ silentFail: true });

    // Check if we should start a queue
    const initialQueue = window.__MUSEEKS_INITIAL_QUEUE;
    if (initialQueue !== null && initialQueue.length > 0) {
      info(
        `Starting queue from file associations (${initialQueue.length} tracks)`,
      );
      usePlayerStore.getState().api.start(initialQueue, initialQueue[0].id, {
        type: 'file_associations',
      });
    }

    this.emit('change');
    then();
  }

  // ======================
  // Language Settings
  // ======================

  async setLanguage(language: Config['language']): Promise<void> {
    await loadTranslation(language);
    await this.set('language', language);
  }

  // ======================
  // Theme Settings
  // ======================

  async setTheme(themeID: string): Promise<void> {
    await this.set('theme', themeID);

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
    this.applyThemeToUI(theme);
  }

  applyThemeToUI(themeID: string): void {
    const theme = getTheme(themeID);

    const root = document.documentElement;
    Object.entries(theme.variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // ======================
  // UI Settings
  // ======================

  async setUIMainColor(mainColor: Config['ui_accent_color']): Promise<void> {
    await this.set('ui_accent_color', mainColor);
    this.applyUIMainColorToUI(mainColor);
  }

  applyUIMainColorToUI(mainColor: Config['ui_accent_color']): void {
    document.documentElement.style.setProperty('--main-color', mainColor);
  }

  async setTracksDensity(density: Config['track_view_density']): Promise<void> {
    await this.set('track_view_density', density);
  }

  // ======================
  // System Settings
  // ======================

  async toggleMenu(): Promise<void> {
    return invoke('plugin:app-menu|toggle');
  }

  async setDefaultView(defaultView: string): Promise<void> {
    return invoke('plugin:default-view|set', {
      defaultView,
    });
  }

  async toggleSleepBlocker(value: boolean): Promise<void> {
    if (value === true) {
      await invoke('plugin:sleepblocker|enable');
    } else {
      await invoke('plugin:sleepblocker|disable');
    }
  }

  async toggleWaylandCompat(value: boolean): Promise<void> {
    await this.set('wayland_compat', value);
  }

  // ======================
  // Library Settings
  // ======================

  async toggleLibraryAutorefresh(value: boolean): Promise<void> {
    await this.set('library_autorefresh', value);
  }

  async checkForLibraryRefresh(): Promise<void> {
    const autorefreshEnabled = this.getInitial('library_autorefresh');

    if (autorefreshEnabled) {
      useLibraryStore.getState().api.scan();
    }
  }

  // ======================
  // Update Settings
  // ======================

  async toggleAutoUpdateChecker(value: boolean): Promise<void> {
    await this.set('auto_update_checker', value);
  }

  async checkForUpdate(
    options: { silentFail?: boolean } = {},
  ): Promise<void> {
    const shouldCheck = this.config?.auto_update_checker;

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

  // ======================
  // Notification Settings
  // ======================

  async toggleDisplayNotifications(value: boolean): Promise<void> {
    await this.set('notifications', value);
  }

  // ======================
  // Audio Settings
  // ======================

  async toggleFollowPlayingTrack(value: boolean): Promise<void> {
    await this.set('audio_follow_playing_track', value);
  }
}

// Create singleton instance
export const settings = new SettingsManager();

// React hook for components
export function useSettings(): Config {
  const config = useSyncExternalStore(
    settings.subscribe,
    settings.getSnapshot,
    () => null, // Server snapshot
  );
  
  // Fallback to initial config if store hasn't loaded yet
  return config ?? window.__MUSEEKS_INITIAL_CONFIG;
}

// Export the singleton as default for backward compatibility
export default settings;