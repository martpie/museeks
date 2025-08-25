import { t } from '@lingui/core/macro';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { info } from '@tauri-apps/plugin-log';
import { EventEmitter } from 'eventemitter3';
import { useSyncExternalStore } from 'react';
import * as semver from 'semver';

import type { Config } from '../generated/typings';
import ConfigBridge from '../lib/bridge-config';
import { loadTranslation } from '../lib/i18n';
import { getTheme } from '../lib/themes';
import { logAndNotifyError } from '../lib/utils';
import useLibraryStore from './useLibraryStore';
import usePlayerStore from './usePlayerStore';
import useToastsStore from './useToastsStore';

export const DEFAULT_MAIN_COLOR = '#459ce7';

/**
 * Unified Settings Store using EventEmitter for React's useSyncExternalStore
 * Combines functionality from SettingsAPI, SettingsBridge, and ConfigBridge
 */
class SettingsStore extends EventEmitter {
  private config: Config | null = null;
  private initialized = false;

  async init(then: () => void): Promise<void> {
    if (this.initialized) {
      then();
      return;
    }

    this.initialized = true;

    // Load initial config
    this.config = await ConfigBridge.getAll();

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

  getSnapshot = (): Config | null => this.config;

  subscribe = (callback: () => void) => {
    this.on('change', callback);
    return () => this.off('change', callback);
  };

  // Config operations
  get<T extends keyof Config>(key: T): Config[T] | undefined {
    return this.config?.[key];
  }

  async set<T extends keyof Config>(key: T, value: Config[T]): Promise<void> {
    await ConfigBridge.set(key, value);
    this.config = await ConfigBridge.getAll();
    this.emit('change');
  }

  async getAll(): Promise<Config> {
    this.config = await ConfigBridge.getAll();
    this.emit('change');
    return this.config;
  }

  // Language settings
  async setLanguage(language: Config['language']): Promise<void> {
    await loadTranslation(language);
    await this.set('language', language);
  }

  // Theme settings
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

  // UI settings
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

  // System settings (from SettingsBridge)
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

  // Library settings
  async toggleLibraryAutorefresh(value: boolean): Promise<void> {
    await this.set('library_autorefresh', value);
  }

  async checkForLibraryRefresh(): Promise<void> {
    const autorefreshEnabled = ConfigBridge.getInitial('library_autorefresh');

    if (autorefreshEnabled) {
      useLibraryStore.getState().api.scan();
    }
  }

  // Update settings
  async toggleAutoUpdateChecker(value: boolean): Promise<void> {
    await this.set('auto_update_checker', value);
  }

  async checkForUpdate(options: { silentFail?: boolean } = {}): Promise<void> {
    const shouldCheck = await this.get('auto_update_checker');

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

  // Notification settings
  async toggleDisplayNotifications(value: boolean): Promise<void> {
    await this.set('notifications', value);
  }

  // Audio settings
  async toggleFollowPlayingTrack(value: boolean): Promise<void> {
    await this.set('audio_follow_playing_track', value);
  }
}

// Create singleton instance
export const settingsStore = new SettingsStore();

// React hook for components
export function useSettings(): Config {
  const config = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    () => null, // Server snapshot
  );
  
  // Fallback to initial config if store hasn't loaded yet
  return config ?? window.__MUSEEKS_INITIAL_CONFIG;
}

// Expose the store instance for direct access when needed
export default settingsStore;
