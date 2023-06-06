import { ipcRenderer } from 'electron';

import { Playlist, TrackModel, PlaylistModel } from '../../../shared/types/museeks';
import logger from '../../../shared/lib/logger';
import channels from '../../../shared/lib/ipc-channels';
import router from '../../views/router';
import useToastsStore from '../../stores/useToastsStore';
import usePlayerStore from '../../stores/usePlayerStore';

const { db } = window.MuseeksAPI;

/**
 * Start playing playlist (on double click)
 */
export const play = async (playlistId: string): Promise<void> => {
  try {
    const playlist: PlaylistModel = await db.playlists.findOnlyByID(playlistId);
    const tracks: TrackModel[] = await db.tracks.findByID(playlist.tracks);
    usePlayerStore.getState().api.start(tracks).catch(logger.warn);
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Create a new playlist
 */
export const create = async (
  name: string,
  tracks: string[] = [],
  importPath: string | false = false,
  redirect = false
): Promise<string> => {
  const playlist: Playlist = {
    name,
    tracks,
  };

  if (importPath) playlist.importPath = importPath;

  const doc = await db.playlists.insert(playlist);

  if (redirect) router.navigate(`/playlists/${doc._id}`);
  else useToastsStore.getState().api.add('success', `The playlist "${name}" was created`);

  return doc._id;
};

/**
 * Rename a playlist
 */
export const rename = async (_id: string, name: string): Promise<void> => {
  try {
    await db.playlists.updateWithRawQuery(_id, { $set: { name } });
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Delete a playlist
 */
export const remove = async (_id: string): Promise<void> => {
  try {
    await db.playlists.remove([_id]);
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Add tracks to a playlist
 */
export const addTracks = async (_id: string, tracksIds: string[], isShown?: boolean): Promise<void> => {
  // isShown should never be true, letting it here anyway to remember of a design issue
  if (isShown) return;

  const toastsAPI = useToastsStore.getState().api;

  try {
    const playlist = await db.playlists.findOnlyByID(_id);
    const playlistTracks = playlist.tracks.concat(tracksIds);
    await db.playlists.updateWithRawQuery(_id, { $set: { tracks: playlistTracks } });
    router.revalidate();
    toastsAPI.add('success', `${tracksIds.length} tracks were successfully added to "${playlist.name}"`);
  } catch (err) {
    logger.warn(err);
    if (err instanceof Error) {
      toastsAPI.add('danger', err.message);
    } else {
      toastsAPI.add('danger', 'An unknown error happened while trying to add tracks.');
    }
  }
};

/**
 * Remove tracks from a playlist
 */
export const removeTracks = async (playlistId: string, tracksIds: string[]): Promise<void> => {
  try {
    const playlist = await db.playlists.findOnlyByID(playlistId);
    const playlistTracks = playlist.tracks.filter((elem: string) => !tracksIds.includes(elem));
    await db.playlists.updateWithRawQuery(playlistId, { $set: { tracks: playlistTracks } });
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Duplicate a playlist
 */
export const duplicate = async (playlistId: string): Promise<void> => {
  try {
    const playlist = await db.playlists.findOnlyByID(playlistId);
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
export const reorderTracks = async (
  playlistId: string,
  tracksIds: string[],
  targetTrackId: string,
  position: 'above' | 'below'
): Promise<void> => {
  if (tracksIds.includes(targetTrackId)) return;

  try {
    const playlist: Playlist = await db.playlists.findOnlyByID(playlistId);

    const newTracks = playlist.tracks.filter((id) => !tracksIds.includes(id));
    let targetIndex = newTracks.indexOf(targetTrackId);

    if (targetIndex === -1) {
      throw new Error(`Could not find targetTrackId in the playlist "${playlist.name}"`);
    }

    if (position === 'above') {
      targetIndex -= 1;
    }

    newTracks.splice(targetIndex + 1, 0, ...tracksIds);

    await db.playlists.updateWithRawQuery(playlistId, { $set: { tracks: newTracks } });
    router.revalidate();
  } catch (err) {
    logger.warn(err);
  }
};

/**
 * Export a playlist to a .m3u file
 * TODO: investigate why the export playlist path are relative, and not absolute
 */
export const exportToM3u = async (playlistId: string): Promise<void> => {
  const playlist: PlaylistModel = await db.playlists.findOnlyByID(playlistId);
  const tracks: TrackModel[] = await db.tracks.findByID(playlist.tracks);

  ipcRenderer.send(
    channels.PLAYLIST_EXPORT,
    playlist.name,
    tracks.map((track) => track.path)
  );
};
