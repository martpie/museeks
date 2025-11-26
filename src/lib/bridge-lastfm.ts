import { invoke } from '@tauri-apps/api/core';

import type { LastfmAuthUrl, LastfmUser } from '../generated/typings';
import { logAndNotifyError } from './utils';

/**
 * Last.fm Bridge for the UI to communicate with the backend.
 * Handles authentication and API communication with Last.fm.
 */
const LastfmBridge = {
  /**
   * Step 1: Get authentication URL to open in browser
   * Returns the URL and token needed for authorization
   */
  async getAuthUrl(): Promise<LastfmAuthUrl> {
    try {
      return await invoke('plugin:lastfm|lastfm_get_auth_url');
    } catch (err) {
      logAndNotifyError(err);
      throw err;
    }
  },

  /**
   * Step 2: Exchange token for session key after user authorizes
   * This should be called after the user has authorized the app on Last.fm
   */
  async getSession(token: string): Promise<LastfmUser> {
    try {
      return await invoke('plugin:lastfm|lastfm_get_session', { token });
    } catch (err) {
      logAndNotifyError(err);
      throw err;
    }
  },

  /**
   * Disconnect from Last.fm (clear session)
   */
  async disconnect(): Promise<void> {
    try {
      await invoke('plugin:lastfm|lastfm_disconnect');
    } catch (err) {
      logAndNotifyError(err);
      throw err;
    }
  },

  /**
   * Test the current Last.fm connection
   * Returns true if connected and session is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      return await invoke('plugin:lastfm|lastfm_test_connection');
    } catch (err) {
      logAndNotifyError(err);
      return false;
    }
  },
};

export default LastfmBridge;
