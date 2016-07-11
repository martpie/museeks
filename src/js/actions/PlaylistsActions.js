import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../utils/app';



let PlaylistsActions = {

    refresh: function() {

        app.db.find({ type : 'playlist' }).sort({ name : 1 }).exec(function (err, playlists) {
            if (err) throw err;
            else {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_PLAYLISTS_REFRESH,
                    playlists  : playlists
                });
            }
        });
    },

    create: function(name) {

        var self = this;
        var playlist = {
            type   : 'playlist',
            name   :  name,
            tracks :  []
        };

        app.db.insert(playlist, function (err, newDoc) {
            if(err) console.warn(err);
            else PlaylistsActions.refresh();
        });
    },

    updateName: function(_id, name) {

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

    }
}

export default PlaylistsActions;
