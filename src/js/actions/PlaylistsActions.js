import store from '../store.js';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app from '../lib/app';

import { hashHistory } from 'react-router';


const load = (_id) => {
    app.models.Playlist.findOne( { _id }, (err, playlist) => {
        if (err) console.warn(err);
        else {
            app.models.Track.find( { _id: { $in: playlist.tracks } }, (err, tracks) => {
                store.dispatch({
                    type: AppConstants.APP_PLAYLISTS_LOAD_ONE,
                    tracks
                });
            });
        }
    });
};

const refresh = () => {
    app.models.Playlist.find({}).sort( { name: 1 } ).exec((err, playlists) => {
        if (err) console.warn(err);
        else {
            store.dispatch({
                type: AppConstants.APP_PLAYLISTS_REFRESH,
                playlists
            });
        }
    });
};

const noop = () => {};

const create = (name, redirect = false, callback = noop) => {
    const playlist = {
        name,
        tracks: []
    };

    app.models.Playlist.insert(playlist, (err, doc) => {
        if (err) console.warn(err);
        else {
            // If a callback was provided (e.g create new playlist with selected tracks)
            callback(doc._id);
            refresh();
            if (redirect) hashHistory.push(`/playlists/${doc._id}`);
            else AppActions.toasts.add('success', `The playlist "${name}" was created`);
        }
    });
};

const rename = (_id, name) => {
    app.models.Playlist.update( { _id }, { $set: { name } }, (err) => {
        if (err) console.warn(err);
        else refresh();
    });
};

const remove = (_id) => {
    app.models.Playlist.remove( { _id }, (err) => {
        if (err) console.warn(err);
        else refresh();
    });
};

const addTracksTo = (_id, tracks, isShown) => {
    // isShown should never be true, letting it here anyway to remember of a design issue
    if (!isShown) {
        app.models.Playlist.findOne( { _id }, (err, playlist) => {
            if (err) console.warn(err);
            else {
                const playlistTracks = playlist.tracks.concat(tracks);

                app.models.Playlist.update( { _id }, { $set: { tracks: playlistTracks } }, (err) => {
                    if (err) AppActions.toasts.add('danger', err);
                    else AppActions.toasts.add('success', `${tracks.length} tracks were successfully added to "${playlist.name}"`);
                });
            }
        });
    }
};

const removeTracksFrom = (_id, tracks) => {
    app.models.Playlist.findOne( { _id }, (err, playlist) => {
        if (err) console.warn(err);
        else {
            const playlistTracks = playlist.tracks.filter((elem) => {
                return !tracks.includes(elem);
            });

            app.models.Playlist.update({ _id }, { $set: { tracks: playlistTracks } }, (err) => {
                if (err) console.warn(err);
                else load(_id);
            });
        }
    });
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
