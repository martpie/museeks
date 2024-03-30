import { Playlist } from '../generated/typings';
import router from '../views/router';
import database from '../lib/database';
import { logAndNotifyError } from '../lib/utils';
import { invalidate } from '../lib/query';

import useToastsStore from './useToastsStore';
import usePlayerStore from './usePlayerStore';

/**
 * Start playing playlist (on double click)
 */
const play = async (playlistID: string): Promise<void> => {
  try {
    const playlist = await database.getPlaylist(playlistID);
    const tracks = await database.getTracks(playlist.tracks);
    usePlayerStore.getState().api.start(tracks);
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Create a new playlist
 */
const create = async (
  name: string,
  trackIDs: string[] = [],
  redirect = false,
) => {
  try {
    const playlist = await database.createPlaylist(name, trackIDs);
    invalidate();

    if (redirect) router.navigate(`/playlists/${playlist._id}`);
    else
      useToastsStore
        .getState()
        .api.add('success', `The playlist "${name}" was created`);
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Rename a playlist
 */
const rename = async (playlistID: string, name: string): Promise<void> => {
  try {
    await database.renamePlaylist(playlistID, name);
    invalidate();
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Delete a playlist
 */
const remove = async (playlistID: string): Promise<void> => {
  try {
    await database.deletePlaylist(playlistID);
    // FIX these when there is no more playlists
    invalidate();
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Add tracks to a playlist
 */
const addTracks = async (
  playlistID: string,
  tracksIDs: string[],
  isShown?: boolean,
): Promise<void> => {
  // isShown should never be true, letting it here anyway to remember of a design issue
  if (isShown) return;

  const toastsAPI = useToastsStore.getState().api;

  try {
    const playlist = await database.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.concat(tracksIDs);
    await database.setPlaylistTracks(playlistID, playlistTracks);
    invalidate();
    toastsAPI.add(
      'success',
      `${tracksIDs.length} tracks were successfully added to "${playlist.name}"`,
    );
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Remove tracks from a playlist
 */
const removeTracks = async (
  playlistID: string,
  tracksIDs: string[],
): Promise<void> => {
  try {
    const playlist = await database.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.filter(
      (elem: string) => !tracksIDs.includes(elem),
    );
    await database.setPlaylistTracks(playlistID, playlistTracks);
    invalidate();
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Duplicate a playlist
 */
const duplicate = async (playlistID: string): Promise<void> => {
  try {
    const playlist = await database.getPlaylist(playlistID);
    await database.createPlaylist(`Copy of ${playlist.name}`, playlist.tracks);
    invalidate();
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * Reorder tracks in a playlists
 * TODO: currently only supports one track at a time, at a point you should be
 * able to re-order a selection of tracks
 */
const reorderTracks = async (
  playlistID: string,
  tracksIDs: string[],
  targetTrackID: string,
  position: 'above' | 'below',
): Promise<void> => {
  if (tracksIDs.includes(targetTrackID)) return;

  try {
    const playlist: Playlist = await database.getPlaylist(playlistID);

    const newTracks = playlist.tracks.filter((id) => !tracksIDs.includes(id));
    let targetIndex = newTracks.indexOf(targetTrackID);

    if (targetIndex === -1) {
      throw new Error(
        `Could not find targetTrackID in the playlist "${playlist.name}"`,
      );
    }

    if (position === 'above') {
      targetIndex -= 1;
    }

    newTracks.splice(targetIndex + 1, 0, ...tracksIDs);

    await database.setPlaylistTracks(playlistID, newTracks);
    invalidate();
  } catch (err) {
    logAndNotifyError(err);
  }
};

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
