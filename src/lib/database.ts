import { invoke } from '@tauri-apps/api/core';

import { info } from '@tauri-apps/plugin-log';
import type {
  Playlist,
  ScanResult,
  Track,
  TrackGroup,
} from '../generated/typings';

/**
 * Bridge for the UI to communicate with the backend and manipulate the Database
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class DatabaseBridge {
  // ---------------------------------------------------------------------------
  // Library read/write actions
  // ---------------------------------------------------------------------------

  @LogExecutionTime
  static async getAllTracks(): Promise<Array<Track>> {
    return invoke<Array<Track>>('plugin:database|get_all_tracks');
  }

  @LogExecutionTime
  static async getTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return invoke('plugin:database|get_tracks', {
      ids: trackIDs,
    });
  }

  @LogExecutionTime
  static async updateTrack(track: Track): Promise<Track> {
    return invoke('plugin:database|update_track', {
      track,
    });
  }

  @LogExecutionTime
  static async removeTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return invoke('plugin:database|remove_tracks', {
      ids: trackIDs,
    });
  }

  @LogExecutionTime
  static async importTracks(
    importPaths: Array<string>,
    refresh = false,
  ): Promise<ScanResult> {
    return invoke('plugin:database|scan_library', {
      importPaths,
      refresh,
    });
  }

  @LogExecutionTime
  static async getAllArtists(): Promise<Array<string>> {
    return invoke('plugin:database|get_artists');
  }

  @LogExecutionTime
  static async getArtistTracks(artist: string): Promise<Array<TrackGroup>> {
    return invoke('plugin:database|get_artist_tracks', { artist });
  }

  // ---------------------------------------------------------------------------
  // Playlists read/write actions
  // ---------------------------------------------------------------------------

  @LogExecutionTime
  static async getAllPlaylists(): Promise<Array<Playlist>> {
    return invoke('plugin:database|get_all_playlists');
  }

  @LogExecutionTime
  static async getPlaylist(id: string): Promise<Playlist> {
    return invoke('plugin:database|get_playlist', {
      id,
    });
  }

  @LogExecutionTime
  static async createPlaylist(
    name: string,
    ids: Array<string>,
  ): Promise<Playlist> {
    return invoke('plugin:database|create_playlist', {
      name,
      ids,
    });
  }

  @LogExecutionTime
  static async renamePlaylist(id: string, name: string): Promise<Playlist> {
    return invoke('plugin:database|rename_playlist', {
      id,
      name,
    });
  }

  @LogExecutionTime
  static async setPlaylistTracks(
    id: string,
    tracks: Array<string>,
  ): Promise<Playlist> {
    return invoke('plugin:database|set_playlist_tracks', {
      id,
      tracks,
    });
  }

  @LogExecutionTime
  static async exportPlaylist(id: string): Promise<void> {
    return invoke('plugin:database|export_playlist', {
      id,
    });
  }

  @LogExecutionTime
  static async deletePlaylist(id: string): Promise<void> {
    return invoke('plugin:database|delete_playlist', {
      id,
    });
  }

  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  @LogExecutionTime
  static async reset(): Promise<string | null> {
    return invoke('plugin:database|reset');
  }
}

export default DatabaseBridge;

/**
 * Helpers to compute the time it takes to
 */
function LogExecutionTime(
  // biome-ignore lint/suspicious/noExplicitAny: it's a decorator duh
  _target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  // biome-ignore lint/suspicious/noExplicitAny: we don't know the signature of the original method
  descriptor.value = async function (...args: any[]) {
    const startTime = new Date().getTime();
    const result = await originalMethod.apply(this, args);
    const endTime = new Date().getTime();
    info(`[DatabaseBridge] ${propertyKey} (${endTime - startTime}ms)`);
    return result;
  };

  return descriptor;
}
