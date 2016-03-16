import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';
import AppActions    from './AppActions';

import app from '../utils/app';

import mmd      from 'musicmetadata';
import fs       from 'fs';
import path     from 'path';
import mime     from 'mime';
import walkSync from 'walk-sync';

const dialog = electron.remote.dialog;



export default {

    refreshTracks: function() {
        app.db.find({}).sort({ 'loweredMetas.artist': 1, 'year': 1, 'loweredMetas.album': 1, 'disk.no': 1, 'track.no': 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_REFRESH_LIBRARY,
                    tracks     : tracks
                });
            }
        });
    },

    selectAndPlay: function(id) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_SELECT_AND_PLAY,
            id         : id
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
                        (function forloop(i){
                            if(i < filesListFiltered.length) {

                                var file   = filesListFiltered[i];
                                var stream = fs.createReadStream(file);

                                // store in DB here
                                mmd(stream, { duration: true }, function (err, metadata) {

                                    AppActions.settings.refreshProgress(parseInt(i * 100 / filesListFiltered.length));

                                    forloop(i + 1);
                                    if(err) console.warn('An error occured while reading ' + file + ' id3 tags: ' + err);

                                    fs.realpath(file, (err, realpath) => {

                                        if(err) console.warn(err);

                                        // We don't want it
                                        delete metadata.picture;

                                        // File path
                                        metadata.path = realpath;

                                        // Unknown metas
                                        if(metadata.artist.length === 0) metadata.artist = ['Unknown artist'];
                                        if(metadata.album === null || metadata.album === '') metadata.album = 'Unknown';
                                        if(metadata.title === null || metadata.title === '') metadata.title = path.parse(file).base;
                                        if(metadata.duration == '') metadata.duration = 0; // .wav problem

                                        meta.playCount = 0;

                                        // Formated metas for sorting
                                        metadata.loweredMetas = {
                                            artist      : metadata.artist.map(meta => meta.toLowerCase()),
                                            album       : metadata.album.toLowerCase(),
                                            albumartist : metadata.albumartist.map(meta => meta.toLowerCase()),
                                            title       : metadata.title.toLowerCase(),
                                            genre       : metadata.genre.map(meta => meta.toLowerCase())
                                        }

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
                                    }); // fs.realpath
                                }); // mmd
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
