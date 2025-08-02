import { t } from '@lingui/core/macro';

import type { Config } from '../generated/typings';
import config from './config';
import player from './player';

const SETTINGS: Settings = {
  audio: [
    setting({
      key: 'audio_playback_rate',
      type: 'number',
      min: 0.5,
      max: 5,
      step: 0.1,
      label: t`Playback rate`,
      description: t`Increase the playback rate: a value of 2 will play your music at a 2x speed`,
      async onChange(value) {
        player.setPlaybackRate(value ?? 1);
      },
    }),
    {
      key: 'audio_follow_playing_track',
      type: 'boolean',
      label: t`Follow playing track`,
      description: t`Automatically follow the currently playing track (only when the app is not focused)`,
      async onChange() {},
    },
  ],
  ui: [],
  library: [],
  hidden: [],
};

/**
 * Get the settings for a specific group
 */
export function getSettingsGroup(group: SettingsGroup): Array<Setting> {
  return SETTINGS[group];
}

/**
 * Apply settings based on config
 */
export async function applySettings<T extends keyof Config>(
  key: T,
  value: Config[T],
  callback: (v: Config[T]) => Promise<void>,
): Promise<void> {
  return config.set(key, value).then(() => callback(value));
}

/* -----------------------------------------------------------------------------
 * Type Utilities
 * -----------------------------------------------------------------------------
 */

type SettingNumber = {
  type: 'number';
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
};

type SettingBoolean = {
  type: 'boolean';
  label: string;
  description?: string;
};

type SettingsGroup = 'audio' | 'ui' | 'library' | 'hidden';
type Settings = Record<SettingsGroup, Array<Setting>>;

type Setting<T extends keyof Config = keyof Config> = {
  key: T;
  onChange(value: Config[T]): Promise<void>;
} & (SettingNumber | SettingBoolean);

/**
 * Generate a setting, with right type-narrowing
 */
function setting<T extends keyof Config>(s: Setting<T>): Setting<T> {
  return s satisfies Setting<T>;
}
