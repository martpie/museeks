/*
|--------------------------------------------------------------------------
| Requires
|--------------------------------------------------------------------------
*/

import { EventEmitter } from 'events';
import objectAssign     from 'object-assign';

import app from '../constants/app';

import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

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
            AppStore.library = payload.tracks;
            AppStore.tracks  = payload.tracks;
            AppStore.emit(CHANGE_EVENT);
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
            var config  = JSON.parse(localStorage.getItem('config'));
            var folders = payload.folders;

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
            // nothing here for the moment
            break;

        case(AppConstants.APP_LIBRARY_REFRESH_START):
            AppStore.refreshingLibrary = true;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_REFRESH_END):
            AppStore.refreshingLibrary = false;
            AppStore.emit(CHANGE_EVENT);
            break;
    }
});
