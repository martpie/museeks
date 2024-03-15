import { convertFileSrc, invoke } from '@tauri-apps/api/core';

import type { Playlist, Track } from '../generated/typings';

/**
 * Library Bridge for the UI to communicate with the backend
 */
const library = {
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

  async updateTrack(track: Track) {
    // TODO:
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

  async deletePlaylist(id: string): Promise<void> {
    return invoke('plugin:database|delete_playlist', {
      id,
    });
  },

  // ---------------------------------------------------------------------------
  // Misc.
  // ---------------------------------------------------------------------------
  async reset(): Promise<string | null> {
    return invoke('plugin:database|reset');
  },

  async getCover(path: string): Promise<string | null> {
    const cover = await invoke<string | null>('plugin:cover|get_cover', {
      path,
    });

    if (cover === null) {
      return null;
    }

    return cover.startsWith('data:') ? cover : convertFileSrc(cover);
  },

  // removeTracks
};

export default library;
