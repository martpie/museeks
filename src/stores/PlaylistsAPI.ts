import { PlaylistDoc, TrackDoc } from '../generated/typings';
import logger from '../lib/logger';
import channels from '../lib/ipc-channels';
import router from '../views/router';

import useToastsStore from './useToastsStore';
import usePlayerStore from './usePlayerStore';

/**
 * Start playing playlist (on double click)
 */
const play = async (playlistID: string): Promise<void> => {
  try {
    const playlist: PlaylistDoc = await db.playlists.findOnlyByID(playlistID);
    const tracks: TrackDoc[] = await db.tracks.findByID(playlist.tracks);
    usePlayerStore.getState().api.start(tracks).catch(logger.warn);
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Create a new playlist
 */
const create = async (
  name: string,
  tracks: string[] = [],
  importPath: string | false = false,
  redirect = false,
): Promise<string | null> => {
  try {
    const playlist: PlaylistDoc = {
      name,
      tracks,
    };

    if (importPath) playlist.doc.importPath = importPath;

    const doc = await db.playlists.insert(playlist);
    router.revalidate();

    if (redirect) router.navigate(`/playlists/${doc.id}`);
    else
      useToastsStore
        .getState()
        .api.add('success', `The playlist "${name}" was created`);

    return doc.id;
  } catch (err) {
    logger.error(err);
    useToastsStore
      .getState()
      .api.add('danger', `The playlist coult not be created.`);

    return null;
  }
};

/**
 * Rename a playlist
 */
const rename = async (playlistID: string, name: string): Promise<void> => {
  try {
    await db.playlists.rename(playlistID, name);
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Delete a playlist
 */
const remove = async (playlistID: string): Promise<void> => {
  try {
    await db.playlists.remove(playlistID);
    // FIX these when there is no more playlists
    router.revalidate();
  } catch (err) {
    logger.warn(err);
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
    const playlist = await db.playlists.findOnlyByID(playlistID);
    const playlistTracks = playlist.tracks.concat(tracksIDs);
    await db.playlists.setTracks(playlistID, playlistTracks);
    router.revalidate();
    toastsAPI.add(
      'success',
      `${tracksIDs.length} tracks were successfully added to "${playlist.name}"`,
    );
  } catch (err) {
    logger.warn(err);
    if (err instanceof Error) {
      toastsAPI.add('danger', err.message);
    } else {
      toastsAPI.add(
        'danger',
        'An unknown error happened while trying to add tracks.',
      );
    }
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
    const playlist = await db.playlists.findOnlyByID(playlistID);
    const playlistTracks = playlist.tracks.filter(
      (elem: string) => !tracksIDs.includes(elem),
    );
    await db.playlists.setTracks(playlistID, playlistTracks);
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Duplicate a playlist
 */
const duplicate = async (playlistID: string): Promise<void> => {
  try {
    const playlist = await db.playlists.findOnlyByID(playlistID);
    const { tracks } = playlist;

    const newPlaylist: Playlist = {
      name: `Copy of ${playlist.name}`,
      tracks: tracks,
    };

    await db.playlists.insert(newPlaylist);
    router.revalidate();
  } catch (err) {
    logger.warn(err);
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
    const playlist: PlaylistDoc = await db.playlists.findOnlyByID(playlistID);

    const newTracks = playlist.doc.tracks.filter(
      (id) => !tracksIDs.includes(id),
    );
    let targetIndex = newTracks.indexOf(targetTrackID);

    if (targetIndex === -1) {
      throw new Error(
        `Could not find targetTrackID in the playlist "${playlist.doc.name}"`,
      );
    }

    if (position === 'above') {
      targetIndex -= 1;
    }

    newTracks.splice(targetIndex + 1, 0, ...tracksIDs);

    await db.playlists.setTracks(playlistID, newTracks);
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * a playlist to a .m3u file
 * TODO: investigate why the playlist path are relative, and not absolute
 */
const exportToM3u = async (playlistID: string): Promise<void> => {
  const playlist: PlaylistDoc = await db.playlists.findOnlyByID(playlistID);
  const tracks: TrackDoc[] = await db.tracks.findByID(playlist.doc.tracks);

  ipcRenderer.send(
    channels.PLAYLIST_EXPORT,
    playlist.doc.name,
    tracks.map((track) => track.doc.path),
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
