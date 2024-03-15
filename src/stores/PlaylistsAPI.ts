import { Playlist, Track } from '../generated/typings';
import logger from '../lib/logger';
import channels from '../lib/ipc-channels';
import router from '../views/router';
import library from '../lib/library';
import { logAndNotifyError } from '../lib/utils';
import { invalidate } from '../lib/query';

import useToastsStore from './useToastsStore';
import usePlayerStore from './usePlayerStore';

/**
 * Start playing playlist (on double click)
 */
const play = async (playlistID: string): Promise<void> => {
  try {
    const playlist = await library.getPlaylist(playlistID);
    const tracks = await library.getTracks(playlist.tracks);
    usePlayerStore.getState().api.start(tracks).catch(logger.warn);
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
    const playlist = await library.createPlaylist(name, trackIDs);
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
    await library.renamePlaylist(playlistID, name);
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
    await library.deletePlaylist(playlistID);
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
    const playlist = await library.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.concat(tracksIDs);
    await library.setPlaylistTracks(playlistID, playlistTracks);
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
    const playlist = await library.getPlaylist(playlistID);
    const playlistTracks = playlist.tracks.filter(
      (elem: string) => !tracksIDs.includes(elem),
    );
    await library.setPlaylistTracks(playlistID, playlistTracks);
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
    const playlist = await library.getPlaylist(playlistID);
    await library.createPlaylist(`Copy of ${playlist.name}`, playlist.tracks);
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
    const playlist: Playlist = await library.getPlaylist(playlistID);

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

    await library.setPlaylistTracks(playlistID, newTracks);
    invalidate();
  } catch (err) {
    logAndNotifyError(err);
  }
};

/**
 * a playlist to a .m3u file
 * TODO: investigate why the playlist path are relative, and not absolute
 */
const exportToM3u = async (playlistID: string): Promise<void> => {
  const playlist: Playlist = await library.getPlaylist(playlistID);
  const tracks: Track[] = await library.getTracks(playlist.tracks);

  ipcRenderer.send(
    channels.PLAYLIST_EXPORT,
    playlist.name,
    tracks.map((track) => track.path),
  );
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
  exportToM3u,
};

export default PlaylistsAPI;
