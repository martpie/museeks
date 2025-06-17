import { t } from '@lingui/core/macro';
import type { Playlist, Track } from '../generated/typings';
import database from '../lib/database';
import { logAndNotifyError } from '../lib/utils';

import usePlayerStore from './usePlayerStore';
import useToastsStore from './useToastsStore';

/**
 * Start playing playlist (on double click)
 */
async function play(playlistID: string): Promise<void> {
  try {
    const playlist = await database.getPlaylist(playlistID);
    const tracks = await database.getTracks(playlist.tracks);
    usePlayerStore
      .getState()
      .api.start(tracks, null, { type: 'playlist', playlistID });
  } catch (error) {
    logAndNotifyError(error);
  }
}

/**
 * Create a new playlist
 */
async function create(
  name: string,
  trackIDs: Array<string> = [],
  silent = false,
): Promise<Playlist | null> {
  try {
    const playlist = await database.createPlaylist(name, trackIDs);

    if (!silent) {
      useToastsStore
        .getState()
        .api.add('success', t`The playlist "${name}" was created`);
    }

    return playlist;
  } catch (error) {
    logAndNotifyError(error);
  }

  return null;
}

/**
 * Rename a playlist
 */
async function rename(playlistID: string, name: string): Promise<void> {
  try {
    await database.renamePlaylist(playlistID, name);
  } catch (error) {
    logAndNotifyError(error);
  }
}

/**
 * Delete a playlist
 */
async function remove(playlistID: string): Promise<void> {
  try {
    await database.deletePlaylist(playlistID);
  } catch (error) {
    logAndNotifyError(error);
  }
}

/**
 * Add tracks to a playlist
 */
async function addTracks(
  playlistID: string,
  tracksIDs: Array<string>,
): Promise<void> {
  try {
    const playlist = await database.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.concat(tracksIDs);
    await database.setPlaylistTracks(playlistID, playlistTracks);
  } catch (error) {
    logAndNotifyError(error);
  }
}

/**
 * Remove tracks from a playlist
 */
async function removeTracks(
  playlistID: string,
  tracksIDs: Array<string>,
): Promise<void> {
  try {
    const playlist = await database.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.filter(
      (elem: string) => !tracksIDs.includes(elem),
    );
    await database.setPlaylistTracks(playlistID, playlistTracks);
  } catch (error) {
    logAndNotifyError(error);
  }
}

/**
 * Duplicate a playlist
 */
async function duplicate(playlistID: string): Promise<void> {
  try {
    const playlist = await database.getPlaylist(playlistID);
    await database.createPlaylist(`Copy of ${playlist.name}`, playlist.tracks);
  } catch (error) {
    logAndNotifyError(error);
  }
}

/**
 * Reorder tracks in a playlists
 * TODO: currently only supports one track at a time, at a point you should be
 * able to re-order a selection of tracks
 */
async function reorderTracks(
  playlistID: string,
  tracks: Array<Track>,
): Promise<void> {
  try {
    // Save and reload the playlist
    await database.setPlaylistTracks(
      playlistID,
      tracks.map((track) => track.id),
    );
  } catch (error) {
    logAndNotifyError(error);
  }
}

// Should we use something else to harmonize between zustand and non-store APIs?
const PlaylistsAPI = {
  play,
  create,
  rename,
  remove,
  addTracks,
  reorderTracks,
  removeTracks,
  duplicate,
};

export default PlaylistsAPI;
