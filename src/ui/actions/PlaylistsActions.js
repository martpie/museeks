import store from '../store.js';
import history from '../router/history';
import types  from '../constants/action-types';
import * as ToastsActions from './ToastsActions';

import * as app from '../lib/app';


/**
 * Load one playlist from database (Tracks list)
 * @param {String} _id ID of the playlist to load
 * @return {Promise}
 */
export const load = async (_id) => {
  try {
    const playlist = await app.models.Playlist.findOneAsync({ _id });
    const tracks = await app.models.Track.findAsync({ _id: { $in: playlist.tracks } });
    store.dispatch({
      type: types.APP_PLAYLISTS_LOAD_ONE,
      tracks,
    });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Refresh all playlists (Playlists list)
 * @return {Promise} [description]
 */
export const refresh = async () => {
  try {
    const playlists = await app.models.Playlist.find({}).sort({ name: 1 }).execAsync();
    store.dispatch({
      type: types.APP_PLAYLISTS_REFRESH,
      playlists,
    });
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Create a new playlist
 * @param {String} name
 * @param {Boolean} [redirect=false]
 * @return {Promise}
 */
export const create = async (name, redirect = false) => {
  const playlist = {
    name,
    tracks: [],
  };

  try {
    const doc = await app.models.Playlist.insertAsync(playlist);
    refresh();
    if (redirect) history.push(`/playlists/${doc._id}`);
    else ToastsActions.add('success', `The playlist "${name}" was created`);
    return doc._id;
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Rename a playlist
 * @param {String} _id ID of the playlist to rename
 * @param {String} name new name of the playlist
 * @return {Promise}
 */
export const rename = async (_id, name) => {
  try {
    await app.models.Playlist.updateAsync({ _id }, { $set: { name } });
    refresh();
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Delete a playlist
 * @param {String}  _id ID of the playlist to remove
 * @return {Promise}
 */
export const remove = async (_id) => {
  try {
    await app.models.Playlist.removeAsync({ _id });
    refresh();
  } catch (err) {
    console.warn(err);
  }
};

/**
 * Add tracks to a playlist
 * @param {String} _id ID of the playlist
 * @param {String[]} tracks Array of tracks IDs
 * @param {Boolean} isShown
 * @return {Promise}
 */
export const addTracksTo = async (_id, tracks, isShown) => {
  // isShown should never be true, letting it here anyway to remember of a design issue
  if (isShown) return;

  try {
    const playlist = await app.models.Playlist.findOneAsync({ _id });
    const playlistTracks = playlist.tracks.concat(tracks);
    await app.models.Playlist.updateAsync({ _id }, { $set: { tracks: playlistTracks } });
    ToastsActions.add('success', `${tracks.length} tracks were successfully added to "${playlist.name}"`);
  } catch (err) {
    console.warn(err);
    ToastsActions.add('danger', err);
  }
};

/**
 * Remove tracks from a playlist
 * @param {String} _id ID of the playlist
 * @param {String} tracks Array of tracks IDs
 * @return {Promise}
 */
export const removeTracks = async (_id, tracks) => {
  try {
    const playlist = await app.models.Playlist.findOneAsync({ _id });
    const playlistTracks = playlist.tracks.filter((elem) => {
      return !tracks.includes(elem);
    });
    await app.models.Playlist.updateAsync({ _id }, { $set: { tracks: playlistTracks } });
    load(_id);
  } catch (err) {
    console.warn(err);
  }
};
