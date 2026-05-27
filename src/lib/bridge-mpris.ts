import { invoke } from '@tauri-apps/api/core';
import { type as osType } from '@tauri-apps/plugin-os';

import { unsmoothifyVolume } from './utils-player';

const isLinux = osType() === 'linux';

const MprisBridge = {
  async updatePlaybackStatus(playing: boolean): Promise<void> {
    if (!isLinux) return;
    await invoke('plugin:mpris|update_playback_status', { playing });
  },

  async updateTrackMetadata(metadata: {
    title: string;
    artists: string[];
    album: string;
    durationSecs: number;
    coverPath: string | null;
    trackNo: number | null;
    trackId: string;
  }): Promise<void> {
    if (!isLinux) return;
    await invoke('plugin:mpris|update_track_metadata', metadata);
  },

  async updateVolume(volume: number): Promise<void> {
    if (!isLinux) return;
    // Convert from audio gain (smoothed) to perceptual 0-1 for MPRIS
    await invoke('plugin:mpris|update_volume', {
      volume: unsmoothifyVolume(volume),
    });
  },

  async updateShuffle(shuffle: boolean): Promise<void> {
    if (!isLinux) return;
    await invoke('plugin:mpris|update_shuffle', { shuffle });
  },

  async updateRepeat(repeat: string): Promise<void> {
    if (!isLinux) return;
    await invoke('plugin:mpris|update_repeat', { repeat });
  },

  async updatePosition(positionSecs: number, seeked = false): Promise<void> {
    if (!isLinux) return;
    await invoke('plugin:mpris|update_position', { positionSecs, seeked });
  },

  async clearMetadata(): Promise<void> {
    if (!isLinux) return;
    await invoke('plugin:mpris|clear_metadata');
  },
};

export default MprisBridge;
