import store from '../store.js';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app from '../lib/app';

import { hashHistory } from 'react-router';


const PlaylistsActions = {

    load: function(_id) {

        app.models.Playlist.findOne({ _id }, (err, playlist) => {
            if(err) console.warn(err);
            else {
                app.models.Track.find({ _id: { $in: playlist.tracks } }, (err, tracks) => {
                    store.dispatch({
                        type : AppConstants.APP_PLAYLISTS_LOAD_ONE,
                        tracks
                    });
                });
            }
        });
    },

    refresh: function() {

        app.models.Playlist.find({}).sort({ name : 1 }).exec((err, playlists) => {
            if (err) console.warn(err);
            else {
                store.dispatch({
                    type : AppConstants.APP_PLAYLISTS_REFRESH,
                    playlists
                });
            }
        });
    },

    create: function(name, redirect = false, callback = () => {}) {

        const playlist = {
            name,
            tracks :  []
        };

        app.models.Playlist.insert(playlist, (err, doc) => {
            if(err) console.warn(err);
            else {
                // If a callback was provided (e.g create new playlist with selected tracks)
                callback(doc._id);
                PlaylistsActions.refresh();
                if(redirect) hashHistory.push(`/playlists/${doc._id}`);
                else AppActions.notifications.add('success', `The playlist "${name}" was created`);
            }
        });
    },

    rename: function(_id, name) {

        app.models.Playlist.update({ _id }, { $set: { name } }, (err) => {

            if(err) console.warn(err);
            else PlaylistsActions.refresh();
        });
    },

    delete: function(_id) {

        app.models.Playlist.remove({ _id }, (err) => {

            if(err) console.warn(err);
            else PlaylistsActions.refresh();
        });
    },

    addTracksTo: function(_id, tracks, isShown) {

        // isShown should never be true, letting it here anyway to remember of a design issue
        if(!isShown) {
            app.models.Playlist.findOne({ _id }, (err, playlist) => {
                if (err) console.warn(err);
                else {

                    const playlistTracks = playlist.tracks.concat(tracks);

                    app.models.Playlist.update({ _id }, { $set: { tracks: playlistTracks } }, (err) => {

                        if(err) AppActions.notifications.add('danger', err);
                        else AppActions.notifications.add('success', `${tracks.length} tracks were successfully added to "${playlist.name}"`);
                    });
                }
            });
        }
    },

    removeTracksFrom: function(_id, tracks) {

        app.models.Playlist.findOne({ _id }, (err, playlist) => {
            if(err) console.warn(err);
            else {

                const playlistTracks = playlist.tracks.filter((elem) => {
                    return !tracks.includes(elem);
                });

                app.models.Playlist.update({ _id }, { $set: { tracks: playlistTracks } }, (err) => {

                    if(err) console.warn(err);
                    else PlaylistsActions.load(_id);
                });
            }
        });
    }
};

export default PlaylistsActions;
