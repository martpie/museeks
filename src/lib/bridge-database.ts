import { invoke } from '@tauri-apps/api/core';
import { info } from '@tauri-apps/plugin-log';

import type {
  Playlist,
  ScanResult,
  Track,
  TrackGroup,
} from '../generated/typings';

export interface DatabaseBridgeInterface {
  getAllTracks(): Promise<Array<Track>>;
  getTracks(trackIDs: Array<string>): Promise<Array<Track>>;
  updateTrack(track: Track): Promise<Track>;
  removeTracks(trackIDs: Array<string>): Promise<Array<Track>>;
  importTracks(
    importPaths: Array<string>,
    refresh?: boolean,
  ): Promise<ScanResult>;
  getAllArtists(): Promise<Array<string>>;
  getArtistTracks(artist: string): Promise<Array<TrackGroup>>;
  getAllPlaylists(): Promise<Array<Playlist>>;
  getPlaylist(id: string): Promise<Playlist>;
  createPlaylist(name: string, ids: Array<string>): Promise<Playlist>;
  renamePlaylist(id: string, name: string): Promise<Playlist>;
  setPlaylistTracks(id: string, tracks: Array<string>): Promise<Playlist>;
  exportPlaylist(id: string): Promise<void>;
  deletePlaylist(id: string): Promise<void>;
  reset(): Promise<string | null>;
}

/**
 * Bridge for the UI to communicate with the backend and manipulate the Database.
 * Grouped here so they're easier to mock in E2E tests.
 */
class DatabaseBridge implements DatabaseBridgeInterface {
  // ---------------------------------------------------------------------------
  // Library read/write actions
  // ---------------------------------------------------------------------------

  @LogExecutionTime
  async getAllTracks(): Promise<Array<Track>> {
    return invoke<Array<Track>>('plugin:database|get_all_tracks');
  }

  @LogExecutionTime
  async getTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return invoke('plugin:database|get_tracks', {
      ids: trackIDs,
    });
  }

  @LogExecutionTime
  async updateTrack(track: Track): Promise<Track> {
    return invoke('plugin:database|update_track', {
      track,
    });
  }

  @LogExecutionTime
  async removeTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return invoke('plugin:database|remove_tracks', {
      ids: trackIDs,
    });
  }

  @LogExecutionTime
  async importTracks(
    importPaths: Array<string>,
    refresh = false,
  ): Promise<ScanResult> {
    return invoke('plugin:database|scan_library', {
      importPaths,
      refresh,
    });
  }

  @LogExecutionTime
  async getAllArtists(): Promise<Array<string>> {
    return invoke('plugin:database|get_artists');
  }

  @LogExecutionTime
  async getArtistTracks(artist: string): Promise<Array<TrackGroup>> {
    return invoke('plugin:database|get_artist_tracks', { artist });
  }

  // ---------------------------------------------------------------------------
  // Playlists read/write actions
  // ---------------------------------------------------------------------------

  @LogExecutionTime
  async getAllPlaylists(): Promise<Array<Playlist>> {
    return invoke('plugin:database|get_all_playlists');
  }

  @LogExecutionTime
  async getPlaylist(id: string): Promise<Playlist> {
    return invoke('plugin:database|get_playlist', {
      id,
    });
  }

  @LogExecutionTime
  async createPlaylist(name: string, ids: Array<string>): Promise<Playlist> {
    return invoke('plugin:database|create_playlist', {
      name,
      ids,
    });
  }

  @LogExecutionTime
  async renamePlaylist(id: string, name: string): Promise<Playlist> {
    return invoke('plugin:database|rename_playlist', {
      id,
      name,
    });
  }

  @LogExecutionTime
  async setPlaylistTracks(
    id: string,
    tracks: Array<string>,
  ): Promise<Playlist> {
    return invoke('plugin:database|set_playlist_tracks', {
      id,
      tracks,
    });
  }

  @LogExecutionTime
  async exportPlaylist(id: string): Promise<void> {
    return invoke('plugin:database|export_playlist', {
      id,
    });
  }

  @LogExecutionTime
  async deletePlaylist(id: string): Promise<void> {
    return invoke('plugin:database|delete_playlist', {
      id,
    });
  }

  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  @LogExecutionTime
  async reset(): Promise<string | null> {
    return invoke('plugin:database|reset');
  }
}

export default new DatabaseBridge();

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
    const startTime = Date.now();
    const result = await originalMethod.apply(this, args);
    const endTime = Date.now();
    info(`[DatabaseBridge] ${propertyKey} (${endTime - startTime}ms)`);
    return result;
  };

  return descriptor;
}
