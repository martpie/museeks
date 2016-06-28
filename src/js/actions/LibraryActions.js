import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app   from '../utils/app';
import utils from '../utils/utils';

import path     from 'path';
import fs       from 'fs';
import walkSync from 'walk-sync';
import mime     from 'mime';

const dialog = electron.remote.dialog;



export default {

    refreshTracks: function() {
        app.db.find({ type : 'track' }).sort({ 'loweredMetas.artist': 1, 'year': 1, 'loweredMetas.album': 1, 'disk.no': 1, 'track.no': 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_REFRESH_LIBRARY,
                    tracks     : tracks
                });
            }
        });
    },

    selectAndPlay: function(_id) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_SELECT_AND_PLAY,
            _id         : _id
        });
    },

    filterSearch: function(search) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_FILTER_SEARCH,
            search     : search
        });
    },

    addFolders: function(folders) {

        dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections']}, (folders) => {
            if(folders !== undefined) {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_LIBRARY_ADD_FOLDERS,
                    folders    : folders
                });
            }
        });
    },

    removeFolder: function(index) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_LIBRARY_REMOVE_FOLDER,
            index      : index
        });
    },

    reset: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_LIBRARY_REFRESH_START,
        });

        app.db.remove({ }, { multi: true }, function (err, numRemoved) {
            app.db.loadDatabase(function (err) {
                if(err) {
                    throw err
                } else {
                    AppActions.library.refreshTracks();
                    AppDispatcher.dispatch({
                        actionType : AppConstants.APP_LIBRARY_REFRESH_END,
                    });
                }
            });
        });
    },

    refresh: function() {

        let folders = app.config.get('musicFolders');

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_LIBRARY_REFRESH_START
        });

        // Start the big thing
        app.db.remove({}, { multi: true }, function (err, numRemoved) {
            app.db.loadDatabase(function (err) {
                if(err) throw err;
                else {

                    let filesList = [];

                    // Loop through folders
                    folders.forEach(function(folder, index, folders) {
                        // Get the list of files
                        filesList = filesList.concat(walkSync(folder, { directories: false }).map((d) =>  path.join(folder, d)));
                    });

                    // Get the metadatas of all the files
                    let filesListFiltered = filesList.filter((file, i) => {
                        return app.supportedFormats.indexOf(mime.lookup(file)) > -1;
                    }).map((file) => {
                        return fs.realpathSync(file);
                    });

                    if(filesListFiltered.length > 0) {
                        // Fake sync async loop
                        (function forloop(i) {
                            if(i < filesListFiltered.length) {

                                let file = filesListFiltered[i];

                                app.db.find({ path: file }, (err, docs) => {
                                    if(err) console.warn(err);

                                    AppActions.settings.refreshProgress(parseInt(i * 100 / filesListFiltered.length));
                                    forloop(i + 1);

                                    if(docs.length === 0) { // Track is not already in database

                                        utils.getMetadata(file, (metadata) => {

                                            app.db.insert(metadata, function (err, newDoc) {
                                                if(err) console.warn(err);
                                                if(i === filesListFiltered.length - 1) {
                                                    AppActions.library.refreshTracks();
                                                    AppDispatcher.dispatch({
                                                        actionType : AppConstants.APP_LIBRARY_REFRESH_END
                                                    });
                                                }
                                            });
                                        });
                                    } else {
                                        // Track is already in database
                                        if(i === filesListFiltered.length - 1) {
                                            AppActions.library.refreshTracks();
                                            AppDispatcher.dispatch({
                                                actionType : AppConstants.APP_LIBRARY_REFRESH_END
                                            });
                                        }
                                    }
                                });
                            }
                        })(0);
                    } else {
                        AppDispatcher.dispatch({
                            actionType : AppConstants.APP_LIBRARY_REFRESH_END
                        });
                    }
                }
            });
        });
    }
}
