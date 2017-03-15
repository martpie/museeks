import store from '../store.js';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app from '../lib/app';

import { hashHistory } from 'react-router';


const load = async (_id) => {
    try {
        const playlist = await app.models.Playlist.findOneAsync({ _id });
        const tracks = await app.models.Track.findAsync({ _id: { $in: playlist.tracks } });
        store.dispatch({
            type: AppConstants.APP_PLAYLISTS_LOAD_ONE,
            tracks
        });
    } catch (err) {
        console.warn(err);
    }
};

const refresh = async () => {
    try {
        const playlists = await app.models.Playlist.find({}).sort({ name: 1 }).execAsync();
        store.dispatch({
            type: AppConstants.APP_PLAYLISTS_REFRESH,
            playlists
        });
    } catch (err) {
        console.warn(err);
    }
};

const create = async (name, redirect = false) => {
    const playlist = {
        name,
        tracks: []
    };

    try {
        const doc = await app.models.Playlist.insertAsync(playlist);
        refresh();
        if (redirect) hashHistory.push(`/playlists/${doc._id}`);
        else AppActions.toasts.add('success', `The playlist "${name}" was created`);
        return doc._id;
    } catch (err) {
        console.warn(err);
    }
};

const rename = async (_id, name) => {
    try {
        await app.models.Playlist.updateAsync({ _id }, { $set: { name } });
        refresh();
    } catch (err) {
        console.warn(err);
    }
};

const remove = async (_id) => {
    try {
        await app.models.Playlist.removeAsync({ _id });
        refresh();
    } catch (err) {
        console.warn(err);
    }
};

const addTracksTo = async (_id, tracks, isShown) => {
    // isShown should never be true, letting it here anyway to remember of a design issue
    if (isShown) return;

    try {
        const playlist = await app.models.Playlist.findOneAsync({ _id });
        const playlistTracks = playlist.tracks.concat(tracks);
        await app.models.Playlist.updateAsync({ _id }, { $set: { tracks: playlistTracks } });
        AppActions.toasts.add('success', `${tracks.length} tracks were successfully added to "${playlist.name}"`);
    } catch (err) {
        console.warn(err);
        AppActions.toasts.add('danger', err);
    }
};

const removeTracksFrom = async (_id, tracks) => {
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

export default{
    load,
    refresh,
    create,
    rename,
    remove,
    addTracksTo,
    removeTracksFrom
};
