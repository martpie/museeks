import { invoke } from '@tauri-apps/api/core';

/**
 * Bridge for various Settings-related actions.
 * Grouped here so they're easier to mock in E2E tests.
 */
const SettingsBridge = {
  /**
   * Show/hide global menu
   */
  async toggleMenu(): Promise<void> {
    return invoke('plugin:app-menu|toggle');
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
};

export default SettingsBridge;
