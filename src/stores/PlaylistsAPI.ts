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
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Create a new playlist
 */
async function create(
  name: string,
  trackIDs: string[] = [],
  silent = false,
): Promise<Playlist | null> {
  try {
    const playlist = await database.createPlaylist(name, trackIDs);

    if (!silent) {
      useToastsStore
        .getState()
        .api.add('success', `The playlist "${name}" was created`);
    }

    return playlist;
  } catch (err) {
    logAndNotifyError(err);
  }

  return null;
}

/**
 * Rename a playlist
 */
async function rename(playlistID: string, name: string): Promise<void> {
  try {
    await database.renamePlaylist(playlistID, name);
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Delete a playlist
 */
async function remove(playlistID: string): Promise<void> {
  try {
    await database.deletePlaylist(playlistID);
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Add tracks to a playlist
 */
async function addTracks(
  playlistID: string,
  tracksIDs: string[],
  isShown?: boolean,
): Promise<void> {
  // isShown should never be true, letting it here anyway to remember of a design issue
  if (isShown) return;

  const toastsAPI = useToastsStore.getState().api;

  try {
    const playlist = await database.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.concat(tracksIDs);
    await database.setPlaylistTracks(playlistID, playlistTracks);
    toastsAPI.add(
      'success',
      `${tracksIDs.length} tracks were successfully added to "${playlist.name}"`,
    );
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Remove tracks from a playlist
 */
async function removeTracks(
  playlistID: string,
  tracksIDs: string[],
): Promise<void> {
  try {
    const playlist = await database.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.filter(
      (elem: string) => !tracksIDs.includes(elem),
    );
    await database.setPlaylistTracks(playlistID, playlistTracks);
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Duplicate a playlist
 */
async function duplicate(playlistID: string): Promise<void> {
  try {
    const playlist = await database.getPlaylist(playlistID);
    await database.createPlaylist(`Copy of ${playlist.name}`, playlist.tracks);
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Reorder tracks in a playlists
 * TODO: currently only supports one track at a time, at a point you should be
 * able to re-order a selection of tracks
 */
async function reorderTracks(
  playlistID: string,
  tracks: Track[],
): Promise<void> {
  try {
    // Save and reload the playlist
    await database.setPlaylistTracks(
      playlistID,
      tracks.map((track) => track.id),
    );
  } catch (err) {
    logAndNotifyError(err);
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
