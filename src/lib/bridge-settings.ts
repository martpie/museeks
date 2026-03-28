import { invoke } from '@tauri-apps/api/core';

import ConfigBridge from './bridge-config';

/**
 * Bridge for various Settings-related actions.
 * Grouped here so they're easier to mock in E2E tests.
 */
const SettingsBridge = {
  /**
   * Show the app menu bar
   */
  async showMenu(): Promise<void> {
    return invoke('plugin:app-menu|show');
  },

  /**
   * Hide the app menu bar
   */
  async hideMenu(): Promise<void> {
    return invoke('plugin:app-menu|hide');
  },

  /**
   * Show the window and apply the persisted menu bar visibility
   */
  async showWindow(): Promise<void> {
    return invoke('plugin:app-menu|show_window');
  },

  /**
   * Set default view on startup
   */
  async setDefaultView(defaultView: string): Promise<void> {
    return invoke('plugin:default-view|set', {
      defaultView,
    });
  },

  /**
   * Toggle sleep blocker
   */
  async toggleSleepBlocker(value: boolean): Promise<void> {
    if (value === true) {
      await invoke('plugin:sleepblocker|enable');
    } else {
      await invoke('plugin:sleepblocker|disable');
    }
  },

  /**
   * Enable Wayland potential compatibility fixes
   */
  async toggleWaylandCompat(value: boolean): Promise<void> {
    await ConfigBridge.set('wayland_compat', value);
  },
};

export default SettingsBridge;
