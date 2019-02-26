import store from '../store';
import history from '../router/history';
import types from '../constants/action-types';
import * as ToastsActions from './ToastsActions';

import * as app from '../lib/app';
import { Playlist } from 'src/shared/types/interfaces';

/**
 * Load one playlist from database (Tracks list)
 */
export const load = async (_id: string) => {
  try {
    const playlist = await app.models.Playlist.findOneAsync({ _id });
    const tracks = await app.models.Track.findAsync({ _id: { $in: playlist.tracks } });
    store.dispatch({
      type: types.PLAYLISTS_LOAD_ONE,
      payload: {
        tracks
      }
    });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Refresh all playlists (Playlists list)
 */
export const refresh = async () => {
  try {
    const playlists = await app.models.Playlist.find({}).sort({ name: 1 }).execAsync();
    store.dispatch({
      type: types.PLAYLISTS_REFRESH,
      payload: {
        playlists
      }
    });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Create a new playlist
 */
export const create = async (name: string, redirect = false): Promise<string> => {
  const playlist = {
    name,
    tracks: []
  };

  const doc = await app.models.Playlist.insertAsync(playlist);

  await refresh();

  if (redirect) history.push(`/playlists/${doc._id}`);
  else ToastsActions.add('success', `The playlist "${name}" was created`);

  return doc._id;
};

/**
 * Rename a playlist
 */
export const rename = async (_id: string, name: string) => {
  try {
    await app.models.Playlist.updateAsync({ _id }, { $set: { name } });
    await refresh();
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Delete a playlist
 */
export const remove = async (_id: string) => {
  try {
    await app.models.Playlist.removeAsync({ _id });
    await refresh();
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Add tracks to a playlist
 */
export const addTracksTo = async (_id: string, tracksIds: string[], isShown?: boolean) => {
  // isShown should never be true, letting it here anyway to remember of a design issue
  if (isShown) return;

  try {
    const playlist = await app.models.Playlist.findOneAsync({ _id });
    const playlistTracks = playlist.tracks.concat(tracksIds);
    await app.models.Playlist.updateAsync({ _id }, { $set: { tracks: playlistTracks } });
    ToastsActions.add('success', `${tracksIds.length} tracks were successfully added to "${playlist.name}"`);
  } catch (err) {
    console.warn(err);
    ToastsActions.add('danger', err);
  }
};

/**
 * Remove tracks from a playlist
 */
export const removeTracks = async (playlistId: string, tracksIds: string[]) => {
  try {
    const playlist = await app.models.Playlist.findOneAsync({ _id: playlistId });
    const playlistTracks = playlist.tracks.filter((elem: string) => !tracksIds.includes(elem));
    await app.models.Playlist.updateAsync({ _id: playlistId }, { $set: { tracks: playlistTracks } });
    await load(playlistId);
  } catch (err) {
    console.warn(err);
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
) => {
  if (tracksIds.includes(targetTrackId)) return;

  try {
    const playlist: Playlist = await app.models.Playlist.findOneAsync({ _id: playlistId });

    const newTracks = playlist.tracks.filter((id) => !tracksIds.includes(id));
    let targetIndex = newTracks.indexOf(targetTrackId);

    if (targetIndex === -1) {
      throw new Error(`Could not find targetTrackId in the playlist "${playlist.name}"`);
    }

    if (position === 'above') {
      targetIndex -= 1;
    }

    newTracks.splice(targetIndex + 1, 0, ...tracksIds);

    await app.models.Playlist.updateAsync({ _id: playlistId }, { $set: { tracks: newTracks } });
    await load(playlistId);
  } catch (err) {
    console.warn(err);
  }
};
