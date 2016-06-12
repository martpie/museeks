import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app   from '../utils/app';
import utils from '../utils/utils';

import path     from 'path';
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

    addFolders(folders) {

        dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections']}, (folders) => {
            if(folders !== undefined) {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_LIBRARY_ADD_FOLDERS,
                    folders    : folders
                });
            }
        });
    },

    removeFolder(index) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_LIBRARY_REMOVE_FOLDER,
            index      : index
        });
    },

    reset() {
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

    refresh() {

        var folders = app.config.get('musicFolders');

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_LIBRARY_REFRESH_START
        });

        // Start the big thing
        app.db.remove({ }, { multi: true }, function (err, numRemoved) {
            app.db.loadDatabase(function (err) {
                if(err) throw err;
                else {

                    var filesList = [];

                    // Loop through folders
                    folders.forEach(function(folder, index, folders) {
                        // Get the list of files
                        filesList = filesList.concat(walkSync(folder, { directories: false }).map((d) =>  path.join(folder, d)));
                    });

                    var filesListFiltered = [];

                    // Get the metadatas of all the files
                    filesList.forEach((file, i) => {
                        if(app.supportedFormats.indexOf(mime.lookup(file)) > -1) filesListFiltered.push(file);
                    });

                    if(filesListFiltered.length > 0) {
                        // Fake sync async loop
                        (function forloop(i) {
                            if(i < filesListFiltered.length) {

                                var file   = filesListFiltered[i];

                                utils.getMetadata(file, (metadata) => {

                                    AppActions.settings.refreshProgress(parseInt(i * 100 / filesListFiltered.length));

                                    forloop(i + 1);

                                    app.db.find({ path: metadata.path }, function (err, docs) {
                                        if(err) console.warn(err);
                                        if(docs.length === 0) { // Track is not already in database
                                            // Let's insert in the data
                                            app.db.insert(metadata, function (err, newDoc) {
                                                if(err) console.warn(err);
                                                if(i === filesListFiltered.length - 1) {
                                                    AppActions.library.refreshTracks();
                                                    AppDispatcher.dispatch({
                                                        actionType : AppConstants.APP_LIBRARY_REFRESH_END
                                                    });
                                                }
                                            });
                                        } else {
                                            if(i === filesListFiltered.length - 1) {
                                                AppActions.library.refreshTracks();
                                                AppDispatcher.dispatch({
                                                    actionType : AppConstants.APP_LIBRARY_REFRESH_END
                                                });
                                            }
                                        }
                                    }); // db.find
                                }); // utils.getMetadata
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
