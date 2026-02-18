import type { Config } from '../../generated/typings';

export const MOCK_CONFIG: Config = {
  language: 'en',
  theme: 'light',
  ui_accent_color: null,
  audio_volume: 1.0,
  audio_playback_rate: 1.0,
  audio_follow_playing_track: false,
  audio_muted: false,
  audio_shuffle: false,
  audio_repeat: 'None',
  audio_stream_server: false,
  default_view: 'Library',
  library_sort_by: 'Artist',
  library_sort_order: 'Asc',
  library_folders: [],
  library_autorefresh: false,
  sleepblocker: false,
  auto_update_checker: true,
  notifications: false,
  track_view_density: 'normal',
  wayland_compat: false,
};

/**
 * Config Bridge for the UI to communicate with the backend.
 * Grouped here so they're easier to mock in E2E tests.
 */
const ConfigBridge = {
  config: {
    ...MOCK_CONFIG,
  },

  /**
   * Get the initial value of the config at the time of instantiation.
   * Should only be used when starting the app.
   */
  getInitial: (key: keyof typeof MOCK_CONFIG) => {
    return MOCK_CONFIG[key];
  },

  async getAll(): Promise<Config> {
    return this.config;
  },

  async get<T extends keyof Config>(key: T): Promise<Config[T]> {
    const config = await this.getAll();
    return config[key];
  },

  async set<T extends keyof Config>(key: T, value: Config[T]): Promise<void> {
    this.config[key] = value;
    return;
  },
};

export default ConfigBridge;
