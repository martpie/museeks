import { invoke } from '@tauri-apps/api/core';

import type { PlaylistDoc, TrackDoc } from '../generated/typings';

/**
 * Library Bridge for the UI to communicate with the backend
 */
const library = {
  async getAllTracks(): Promise<Array<TrackDoc>> {
    return invoke('plugin:database|get_all_tracks');
  },

  async getAllPlaylists(): Promise<Array<PlaylistDoc>> {
    return invoke('plugin:database|get_all_playlists');
  },

  async importTracks(importPaths: Array<string>): Promise<void> {
    return invoke('plugin:database|import_tracks_to_library', {
      importPaths,
    });
  },

  async getCover(path: string): Promise<string | null> {
    return invoke('plugin:database|get_cover_as_base64', {
      path,
    });
  },

  // TODO: db.
  // playlists.findOnlyByID
  // tracks.findByID
  // removePlaylist
  // removeTracks
  // reset
};

export default library;
