import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../utils/app';



let PlaylistsActions = {

    load: function(_id) {

        app.db.findOne({ _id: _id }, function(err, playlist) {
            if(err) console.warn(err);
            else {
                app.db.find({ type: 'track', _id: { $in: playlist.tracks }}, function(err, tracks) {
                    AppDispatcher.dispatch({
                        actionType : AppConstants.APP_PLAYLISTS_LOAD_ONE,
                        tracks : tracks
                    });
                });
            }
        });
    },

    refresh: function() {

        app.db.find({ type : 'playlist' }).sort({ name : 1 }).exec(function(err, playlists) {
            if (err) console.warn(err);
            else {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_PLAYLISTS_REFRESH,
                    playlists  : playlists
                });
            }
        });
    },

    create: function(name) {

        let self = this;
        let playlist = {
            type   : 'playlist',
            name   :  name,
            tracks :  []
        };

        app.db.insert(playlist, function (err, newDoc) {
            if(err) console.warn(err);
            else PlaylistsActions.refresh();
        });
    },

    rename: function(_id, name) {

        app.db.update({ '_id': _id }, { $set: { name: name }}, { multi: true }, function(err, numReplaced) {

            if(err) console.warn(err);
            else PlaylistsActions.refresh();
        });
    },

    delete: function(_id) {

        app.db.remove({ type: 'playlist', _id: _id }, { multi: true }, function (err, numRemoved) {

            if(err) console.warn(err);
            else PlaylistsActions.refresh();
        });
    },

    addTracksTo: function(_id, tracks) {

        app.db.findOne({ _id: _id }, function (err, playlist) {
            if (err) console.warn(err);
            else {
                let playlistTracks = playlist.tracks;
                playlistTracks.push(...tracks);

                app.db.update({ '_id': _id }, { $set: { tracks: playlistTracks }}, { multi: true }, function(err, numReplaced) {

                    if(err) console.warn(err);
                    else PlaylistsActions.refresh();
                });
            }
        });
    }
}

export default PlaylistsActions;
