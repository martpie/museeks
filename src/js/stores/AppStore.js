/*
|--------------------------------------------------------------------------
| Requires
|--------------------------------------------------------------------------
*/

import { EventEmitter } from 'events';
import objectAssign     from 'object-assign';
import path             from 'path';

import app from '../constants/app';

import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import utils from '../utils/utils';

var CHANGE_EVENT = 'change';



/*
|--------------------------------------------------------------------------
| Store
|--------------------------------------------------------------------------
*/

var AppStore = objectAssign({}, EventEmitter.prototype, {

    library           :  null,  // All tracks
    tracks            :  null,  // All tracks shown on the view
    playlist          :  [],    // Tracks to be played
    playlistCursor    :  null,  // The cursor of the playlist
    oldPlaylist       :  null,  // Playlist backup
    oldPlaylistCursor :  null,  // The last cursor backup (to roll stuff back, e.g. unshuffle)
    playerStatus      : 'stop', // Player status
    notifications     :  {},    // The array of notifications
    refreshingLibrary :  false, // If the app is currently refreshing the app
    repeat            :  false, // the current repeat state (one, all, false)
    shuffle           :  false, // If shuffle mode is enabled
    status            : 'An apple a day keeps Dr Dre away',
    refreshProgress   : 0, // Progress of the refreshing library

    getStore: function() {
        return {
            config            : app.config.getAll(),
            library           : this.library,
            tracks            : this.tracks,
            playlist          : this.playlist,
            playlistCursor    : this.playlistCursor,
            playerStatus      : this.playerStatus,
            notifications     : this.notifications,
            refreshingLibrary : this.refreshingLibrary,
            repeat            : this.repeat,
            shuffle           : this.shuffle,
            status            : this.status,
            refreshProgress   : this.refreshProgress
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
            var tracks = payload.tracks;
            AppStore.library = tracks;
            AppStore.tracks  = tracks;
            if(tracks !== null && tracks.length > 2) AppStore.status  = tracks.length + ' tracks (' + utils.parseDuration(tracks.map(d => d.duration).reduce((a, b) => a + b)) + ')';
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_REFRESH_CONFIG):
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_SELECT_AND_PLAY):

            var playlist       = AppStore.tracks.slice();
            var id             = payload.id;
            var playlistCursor = payload.id;

            var uri = utils.parseURI(playlist[id].path);
                app.audio.src = uri;
                app.audio.play();

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
                var uri = utils.parseURI(playlist[newPlaylistCursor].path); ;
                app.audio.src = uri;
                app.audio.play();

                AppStore.playlistCursor = newPlaylistCursor;

            } else {
                app.audio.pause();
                app.audio.src = '';
                AppStore.playlist          =  [];
                AppStore.playlistCursor    =  null;
                AppStore.oldPlaylistCursor =  null;
                AppStore.playerStatus      = 'stop'
                AppStore.emit(CHANGE_EVENT);
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

                var uri = utils.parseURI(newTrack.path);
                app.audio.src = uri;

                app.audio.play();

                AppStore.playlistCursor = newPlaylistCursor;

            } else {
                app.audio.pause();
                app.audio.src = '';
                AppStore.playlist          =  [];
                AppStore.playlistCursor    =  null;
                AppStore.oldPlaylistCursor =  null;
                AppStore.playerStatus      = 'stop'
                AppStore.emit(CHANGE_EVENT);
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_SHUFFLE):

            if(!AppStore.shuffle) {

                AppStore.oldPlaylist       = AppStore.playlist;
                AppStore.oldPlaylistCursor = AppStore.oldPlaylistCursor;

                // Let's shuffle that
                var playlistCursor = AppStore.playlistCursor;
                var playlist       = AppStore.playlist.slice().splice(playlistCursor + 1, AppStore.playlist.length - (playlistCursor + 1));

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

                AppStore.playlist          = AppStore.oldPlaylist;
                AppStore.oldPlaylistCursor = AppStore.oldPlaylistCursor;
                AppStore.shuffle           = false;

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

        case(AppConstants.APP_PLAYER_JUMP_TO):
            app.audio.currentTime = payload.to;
            break;

        case(AppConstants.APP_QUEUE_CLEAR):
            AppStore.playlist.splice(AppStore.playlistCursor + 1, AppStore.playlist.length - AppStore.playlistCursor);
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_REMOVE):
            AppStore.playlist.splice(AppStore.playlistCursor + payload.index + 1, 1)
            AppStore.emit(CHANGE_EVENT);
            break;

        // Prob here
        case(AppConstants.APP_QUEUE_ADD):
            var selected = payload.selected;
            var tracks   = AppStore.tracks;

            for(var i = 0, length = tracks.length; i < length; i++) {
                if(selected.indexOf(tracks[i]._id) > -1) {
                    AppStore.playlist.push(tracks[i]);
                }
            }

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_ADD_NEXT):
            var selected = payload.selected;
            var tracks   = AppStore.tracks;
            var cursor   = AppStore.playlistCursor;

            for(var i = 0, length = tracks.length; i < length; i++) {
                if(selected.indexOf(tracks[length - i - 1]._id) > -1) {
                    AppStore.playlist.splice(cursor + 1, 0, tracks[length - i - 1]);
                }
            }

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_SET_PLAYLIST):
            AppStore.playlist = payload.playlist;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_ADD_FOLDERS):

            var musicFolders = app.config.get('musicFolders'),
                folders      = payload.folders;

            // Check if we reveived folders
            if(folders !== undefined) {
                // Add folders
                folders.forEach((folder) => {
                    musicFolders.push(folder);
                });

                // Remove duplicates, useless children, ect...
                musicFolders = utils.removeUselessFolders(musicFolders);

                musicFolders.sort();

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();
                AppStore.emit(CHANGE_EVENT);
            }
            break;

        case(AppConstants.APP_LIBRARY_REMOVE_FOLDER):
            var musicFolders = app.config.get('musicFolders');
            musicFolders.splice(payload.index, 1);
            app.config.set('musicFolders', musicFolders);
            app.config.saveSync();

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_RESET):
            // nothing here for the moment
            break;

        case(AppConstants.APP_LIBRARY_REFRESH_START):
            AppStore.status = 'An apple a day keeps Dr Dre away';
            AppStore.refreshingLibrary = true;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_REFRESH_END):
            AppStore.refreshingLibrary      = false;
            AppStore.refreshProgress = 0;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_REFRESH_PROGRESS):
            AppStore.refreshProgress = payload.percentage;
            AppStore.emit(CHANGE_EVENT);
            break;
    }
});
