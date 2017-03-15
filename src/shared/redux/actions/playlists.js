const AppConstants    = require('../constants/AppConstants');
const actions         = require('./index');
const { hashHistory } = require('react-router');
//import app          from '../lib/app';

const load = async (_id) => {
    try {
        const playlist = await lib.playlist.findOne({ query : { _id } });
        const tracks = await lib.track.find({
            query : { _id: { $in: playlist.tracks } }
        });
        store.dispatch({
            type: 'APP_PLAYLISTS_LOAD_ONE',
            tracks
        });
    } catch (err) {
        console.warn(err);
    }
};

const refresh = async () => {
    try {
        const playlists = await lib.playlist.find({
            query : {},
            sort : { name: 1 }
        });
        store.dispatch({
            type: 'APP_PLAYLISTS_REFRESH',
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
        const doc = await lib.playlist.insert(playlist);
        refresh();
        if (redirect) hashHistory.push(`/playlists/${doc._id}`);
        else actions.toasts.add('success', `The playlist "${name}" was created`);
        return doc._id;
    } catch (err) {
        console.warn(err);
    }
};

const rename = async (_id, name) => {
    try {
        await lib.playlist.update({ _id }, { $set: { name } });
        refresh();
    } catch (err) {
        console.warn(err);
    }
};

const remove = async (_id) => {
    try {
        await lib.playlist.remove({ _id });
        refresh();
    } catch (err) {
        console.warn(err);
    }
};

const addTracksTo = async (_id, tracks, isShown) => {
    // isShown should never be true, letting it here anyway to remember of a design issue
    if (isShown) return;

    try {
        const playlist = await lib.playlist.findOne({ query : { _id } });
        const playlistTracks = playlist.tracks.concat(tracks);
        await lib.playlist.update({ _id }, { $set: { tracks: playlistTracks } });
        actions.toasts.add('success', `${tracks.length} tracks were successfully added to "${playlist.name}"`);
    } catch (err) {
        console.warn(err);
        actions.toasts.add('danger', err);
    }
};

const removeTracksFrom = async (_id, tracks) => {
    try {
        const playlist = await lib.playlist.findOne({ query : { _id } });
        const playlistTracks = playlist.tracks.filter((elem) => {
            return !tracks.includes(elem);
        });
        await lib.playlist.update({ _id }, { $set: { tracks: playlistTracks } });
        load(_id);
    } catch (err) {
        console.warn(err);
    }
};

module.exports = {
    load,
    refresh,
    create,
    rename,
    remove,
    addTracksTo,
    removeTracksFrom
};
