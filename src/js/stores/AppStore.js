/*
|--------------------------------------------------------------------------
| Requires
|--------------------------------------------------------------------------
*/

import { EventEmitter } from 'events';
import objectAssign     from 'object-assign';

import walk from 'walk';
import mmd  from 'musicmetadata';
import fs   from 'fs';
import path from 'path';
import mime from 'mime';

import remote from 'remote';

import app from '../constants/app';

import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

var dialog = remote.require('dialog');

var CHANGE_EVENT = 'change';



/*
|--------------------------------------------------------------------------
| Store
|--------------------------------------------------------------------------
*/

var AppStore = objectAssign({}, EventEmitter.prototype, {

    library           :  null, // All tracks
    tracks            :  null, // All tracks shown on the view
    playlist          :  [],   // Tracks to be played
    playlistCursor    :  null, // The cursor of the playlist
    oldPlaylistCursor :  null, // The last cursor backup (to roll stuff back, e.g. unshuffle)
    playerStatus      : 'stop', // Player status
    notifications     :  {},    // The array of notifications
    refreshingLibrary :  false, // If the app is currently refreshing the app
    repeat            :  false, // the current repeat state (one, all, false)
    shuffle           :  false, // If shuffle mode is enabled

    getStore: function() {
        return {
            library           :  this.library,
            tracks            :  this.tracks,
            playlist          :  this.playlist,
            playlistCursor    :  this.playlistCursor,
            oldPlaylistCursor :  this.oldPlaylistCursor,
            playerStatus      :  this.playerStatus,
            notifications     :  this.notifications,
            refreshingLibrary :  this.refreshingLibrary,
            repeat            :  this.repeat,
            shuffle           :  this.shuffle,
            musicFolders      :  JSON.parse(localStorage.getItem('config')).musicFolders
        };
    },

    addChangeListener: function(cb){
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener: function(cb){
        this.removeListener(CHANGE_EVENT, cb);
    }
});

export default AppStore;


/*
|--------------------------------------------------------------------------
| Dispatcher Listener
|--------------------------------------------------------------------------
*/

AppDispatcher.register(function(payload) {

    switch(payload.actionType) {

        case(AppConstants.APP_REFRESH_LIBRARY):
            // Sort tracks by Artist -> year -> album -> disk -> track
            app.db.find({}).sort({ 'lArtist': 1, 'year': 1, 'album': 1, 'disk': 1, 'track.no': 1 }).exec(function (err, tracks) {
                if (err) throw err;
                else {
                    AppStore.library = tracks;
                    AppStore.tracks  = tracks;
                    AppStore.emit(CHANGE_EVENT);
                }
            });
            break;

        case(AppConstants.APP_SELECT_AND_PLAY):
            // Sometimes, noReplay is an event, fix that
            var noReplay = (payload.noReplay === true) ? true : false;

            var playlist       = AppStore.tracks.slice();
            var id             = payload.id;
            var playlistCursor = payload.id;

            // Play it if needed !
            if(!noReplay) {
                app.audio.src = 'file://' + playlist[id].path;
                app.audio.play();
            }

            // Check if we have to shuffle the queue
            if(AppStore.shuffle) {

                var firstTrack = playlist[id];

                var m = playlist.length, t, i;
                while (m) {

                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = playlist[m];
                    playlist[m] = playlist[i];
                    playlist[i] = t;
                }

                playlist.unshift(firstTrack);

                // Let's set the cursor to 0
                playlistCursor = 0;
            }

            // Backup that and change the UI
            AppStore.playerStatus      = 'play';
            AppStore.playlist          =  playlist;
            AppStore.playlistCursor    =  playlistCursor;
            AppStore.oldPlaylistCursor =  id;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_FILTER_SEARCH):

            var search = payload.search;

            var library = AppStore.library;
            var tracks  = [];

            for(var i = 0; i < library.length; i++) {

                var track = library[i];

                if(search != '' && search != undefined) {

                    if(track.lArtist.indexOf(search) === -1
                        && track.album.toLowerCase().indexOf(search) === -1
                        && track.genre.join(', ').toLowerCase().indexOf(search) === -1
                        && track.title.toLowerCase().indexOf(search) === -1) {

                        continue;

                    } else {
                        tracks.push(track);
                    }

                } else {
                    tracks.push(track);
                }
            }

            AppStore.tracks = tracks;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_TOGGLE):
            if(app.audio.paused && AppStore.playlist !== null) {
                AppStore.playerStatus = 'play';
                app.audio.play();
            } else {
                AppStore.playerStatus = 'pause';
                app.audio.pause();
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_PLAY):
            if(AppStore.playlist !== null) {
                AppStore.playerStatus = 'play';
                app.audio.play();
                AppStore.emit(CHANGE_EVENT);
            }
            break;

        case(AppConstants.APP_PLAYER_PAUSE):
            AppStore.playerStatus = 'pause';
            app.audio.pause();
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_STOP):
            app.audio.pause();
            AppStore.library           =  null;
            AppStore.tracks            =  null;
            AppStore.playlist          =  [];
            AppStore.playlistCursor    =  null;
            AppStore.oldPlaylistCursor =  null;
            AppStore.playerStatus      = 'stop'
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_NEXT):
            var e = payload.e;

            if(e !== undefined) e.target.removeEventListener(e.type);

            var playlist = AppStore.playlist;

            if(AppStore.repeat === 'one') {
                newPlaylistCursor = AppStore.playlistCursor;
            } else if (
                AppStore.repeat === 'all' &&
                AppStore.playlistCursor === playlist.length - 1 // is last track
            ) {
                newPlaylistCursor = 0; // start with new track
            } else {
                var newPlaylistCursor  = AppStore.playlistCursor + 1;
            }


            if (playlist[newPlaylistCursor] !== undefined) {

                app.audio.src = playlist[newPlaylistCursor].path;
                app.audio.play();

                AppStore.playlistCursor = newPlaylistCursor;

            } else {

                app.audio.pause();
                app.audio.src = '';

                AppStore.playlist = [];
                AppStore.playlistCursor = null;
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_PREVIOUS):
            if (app.audio.currentTime < 5) {

                var newPlaylistCursor = AppStore.playlistCursor - 1;

            } else {

                var newPlaylistCursor = AppStore.playlistCursor
            }

            var newTrack = AppStore.playlist[newPlaylistCursor];

            if (newTrack !== undefined) {

                app.audio.src = newTrack.path;
                app.audio.play();

                AppStore.playlistCursor = newPlaylistCursor;

            } else {

                AppStore.playlist = null;
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_SHUFFLE):
            if(!AppStore.shuffle) {

                // Let's shuffle that
                var playlist       = AppStore.playlist.slice();
                var playlistCursor = AppStore.playlistCursor;

                var firstTrack = playlist[playlistCursor];

                var m = playlist.length, t, i;
                while (m) {

                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = playlist[m];
                    playlist[m] = playlist[i];
                    playlist[i] = t;
                }

                playlist.unshift(firstTrack);

                AppStore.shuffle           = true;
                AppStore.playlist          = playlist;
                AppStore.playlistCursor    = 0;
                AppStore.oldPlaylistCursor = playlistCursor;

            } else {

                var oldPlaylistCursor = AppStore.oldPlaylistCursor;
                AppStore.shuffle = false;
                // TOFIX
                AppActions.selectAndPlay(oldPlaylistCursor, true);
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_REPEAT):
            var repeatState = AppStore.repeat;
            var newRepeatState;

            if(repeatState === 'all') {
                newRepeatState = 'one';
            } else if (repeatState === 'one') {
                newRepeatState = false;
            } else if (repeatState === false) {
                newRepeatState = 'all';
            }
            AppStore.repeat = newRepeatState;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_CLEAR):
            AppStore.playlist.splice(AppStore.playlistCursor + 1, AppStore.playlist.length - AppStore.playlistCursor);
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_REMOVE):
            AppStore.playlist.splice(AppStore.playlistCursor + payload.index + 1, 1)
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_ADD):
            var selected = payload.selected;
            var playlist = AppStore.playlist.slice();
            var tracks   = AppStore.tracks;

            for(var i = 0; i < selected.length; i++) {
                playlist.push(tracks[selected[i]]);
            }

            AppStore.playlist = playlist;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_ADD_NEXT):
            var selected = payload.selected;
            var playlist = AppStore.playlist;
            var tracks   = AppStore.tracks;
            var cursor   = AppStore.playlistCursor;

            for(var i = 0; i < selected.length; i++) {
                playlist.splice(cursor + 1, 0, tracks[selected[selected.length - i - 1]]);
            }

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_SET_PLAYLIST):
            AppStore.playlist = payload.playlist;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_ADD_FOLDERS):
            var config = JSON.parse(localStorage.getItem('config'));
            var folders = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections']});

            if(folders !== undefined) {
                folders.forEach(function (folder) {
                    config.musicFolders.push(folder);
                });
                localStorage.setItem('config', JSON.stringify(config));
                AppStore.emit(CHANGE_EVENT);
            }
            break;

        case(AppConstants.APP_LIBRARY_REMOVE_FOLDER):
            var config = JSON.parse(localStorage.getItem('config'));
            config.musicFolders.splice(payload.index, 1);
            localStorage.setItem('config', JSON.stringify(config));

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_RESET):
            app.db.reset();
            break;

        case(AppConstants.APP_LIBRARY_REFRESH):
            var start   = new Date().getTime();
            var self    = this;
            var folders = JSON.parse(localStorage.getItem('config')).musicFolders;

            app.db.reset();

            AppStore.refreshingLibrary = true;
            AppStore.emit(CHANGE_EVENT);

            // Start the big thing

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
                        AppStore.refreshingLibrary = false;
                        AppStore.emit(CHANGE_EVENT);
                    }
                });
            });
            break;
    }
});
