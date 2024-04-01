import { invoke } from '@tauri-apps/api/core';

import type { Playlist, Track } from '../generated/typings';

/**
 * Bridge for the UI to communicate with the backend and manipulate the Database
 */
const database = {
  // ---------------------------------------------------------------------------
  // Playlists read/write actions
  // ---------------------------------------------------------------------------

  async getAllTracks(): Promise<Array<Track>> {
    return invoke('plugin:database|get_all_tracks');
  },

  async getTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return invoke('plugin:database|get_tracks', {
      ids: trackIDs,
    });
  },

  // TODO:
  async updateTrack(_track: Track) {
    throw new Error('Not implemented');
  },

  async removeTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return invoke('plugin:database|remove_tracks', {
      ids: trackIDs,
    });
  },

  async importTracks(importPaths: Array<string>): Promise<void> {
    return invoke('plugin:database|import_tracks_to_library', {
      importPaths,
    });
  },

  // ---------------------------------------------------------------------------
  // Playlists read/write actions
  // ---------------------------------------------------------------------------

  async getAllPlaylists(): Promise<Array<Playlist>> {
    return invoke('plugin:database|get_all_playlists');
  },

  async getPlaylist(id: string): Promise<Playlist> {
    return invoke('plugin:database|get_playlist', {
      id,
    });
  },

  async createPlaylist(name: string, tracks: Array<string>): Promise<Playlist> {
    return invoke('plugin:database|create_playlist', {
      name,
      tracks,
    });
  },

  async renamePlaylist(id: string, name: string): Promise<Playlist> {
    return invoke('plugin:database|rename_playlist', {
      id,
      name,
    });
  },

  async setPlaylistTracks(
    id: string,
    tracks: Array<string>,
  ): Promise<Playlist> {
    return invoke('plugin:database|set_playlist_tracks', {
      id,
      tracks,
    });
  },

  async exportPlaylist(id: string): Promise<void> {
    return invoke('plugin:database|export_playlist', {
      id,
    });
  },

  async deletePlaylist(id: string): Promise<void> {
    return invoke('plugin:database|delete_playlist', {
      id,
    });
  },

  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  async reset(): Promise<string | null> {
    return invoke('plugin:database|reset');
  },
};

export default database;
