import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../constants/app.js';

import remote from 'remote';

import walk from 'walk';
import mmd  from 'musicmetadata';
import fs   from 'fs';
import path from 'path';
import mime from 'mime';

var dialog = remote.require('dialog');



var AppActions = {

    /**
     * Refresh the library
     */
    getTracks: function() {
        app.db.find({}).sort({ 'lArtist': 1, 'year': 1, 'album': 1, 'disk': 1, 'track.no': 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_REFRESH_LIBRARY,
                    tracks     : tracks
                });
            }
        });
    },

    /**
     * Select and play a track
     */
    selectAndPlay: function(id, noReplay) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_SELECT_AND_PLAY,
            id         : id,
            noReplay   : noReplay
        });
    },

    /**
     * Search
     */
    filterSearch: function(search) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_FILTER_SEARCH,
            search     : search
        });
    },

    app: {

        close: function() {
            remote.getCurrentWindow().close();
        }
    },

    player: {

        toggle: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_TOGGLE
            });
        },

        play: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_PLAY
            });
        },

        pause: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_PAUSE
            });
        },

        stop: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_STOP
            });
        },

        next: function(e) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_NEXT,
                e          : e
            });
        },

        previous: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_PREVIOUS
            });
        },

        shuffle: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_SHUFFLE
            });
        },

        setVolume: function(volume) {
            app.audio.volume = volume;
            var config = JSON.parse(localStorage.getItem('config'));
                config.volume = volume;

            localStorage.setItem('config', JSON.stringify(config));
        },

        repeat: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_REPEAT
            });
        },

        jumpTo: function(to) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_JUMP_TO,
                to         : to
            });
        }
    },

    queue: {

        clear: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_CLEAR
            });
        },

        remove: function(index) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_REMOVE,
                index      : index
            });
        },

        add: function(selected) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_ADD,
                selected   : selected
            });
        },

        addNext: function(selected) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_ADD_NEXT,
                selected   : selected
            });
        },

        setPlaylist: function(playlist) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_SET_PLAYLIST,
                playlist   : playlist
            });
        }
    },

    library: {

        addFolders(folders) {

            var folders = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections']});

            if(folders !== undefined) {
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_LIBRARY_ADD_FOLDERS,
                    folders    : folders
                });
            }
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
                        AppActions.getTracks();
                        AppDispatcher.dispatch({
                            actionType : AppConstants.APP_LIBRARY_REFRESH_END,
                        });
                    }
                });
            });
        },

        refresh() {
            var start   = new Date().getTime();
            var folders = JSON.parse(localStorage.getItem('config')).musicFolders;

            AppDispatcher.dispatch({
                actionType : AppConstants.APP_LIBRARY_REFRESH_START
            });

            // Start the big thing
            app.db.remove({ }, { multi: true }, function (err, numRemoved) {
                app.db.loadDatabase(function (err) {
                    if(err) {
                        throw err
                    } else {
                        folders.forEach(function(folder, index, folders) {

                            var walker = walk.walk(folder, { followLinks: false });

                            walker.on('file', function (root, fileStat, next) {
                                fs.readFile(path.resolve(root, fileStat.name), function (buffer) {

                                    var file = path.join(root, fileStat.name);

                                    if(app.supportedFormats.indexOf(mime.lookup(file)) > -1) {
                                        // store in DB here

                                        var parser = mmd(fs.createReadStream(file), { duration: true }, function (err, metadata) {

                                            if (err) throw err;

                                            else {
                                                delete metadata.picture;
                                                metadata.path = file;
                                                metadata.lArtist = metadata.artist.length === 0 ? ['unknown artist'] : metadata.artist[0].toLowerCase();

                                                if(metadata.artist.length === 0) metadata.artist = ['Unknown artist'];
                                                if(metadata.album === null || metadata.album === '') metadata.album = 'Unknown';
                                                if(metadata.title === null || metadata.title === '') metadata.title = 'Unknown';

                                                app.db.insert(metadata, function (err, newDoc) {
                                                    if(err) throw err;
                                                });
                                            }
                                        });
                                    }
                                    next();
                                });
                            });
                            walker.on('errors', function (root, nodeStatsArray, next) {
                                nodeStatsArray.forEach(function (n) {
                                    console.error('[ERROR] ' + n.name);
                                    console.error(n.error.message || (n.error.code + ': ' + n.error.path));
                                });
                                next();
                            });
                            walker.on('end', function () {
                                if(folders.length - 1 === index) {
                                    AppDispatcher.dispatch({
                                        actionType : AppConstants.APP_LIBRARY_REFRESH_END
                                    });

                                    AppActions.getTracks();
                                }
                            });
                        });
                    }
                });
            });
        }
    }
};

export default AppActions;
