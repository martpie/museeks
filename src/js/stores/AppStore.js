/*
|--------------------------------------------------------------------------
| Requires
|--------------------------------------------------------------------------
*/

import { EventEmitter } from 'events';
import objectAssign     from 'object-assign';
import path             from 'path';
import fs               from 'fs';

import app from '../utils/app';

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
    queue             :  [],    // Tracks to be played
    queueCursor       :  null,  // The cursor of the queue
    oldQueue          :  null,  // Queue backup
    oldQueueCursor    :  null,  // The last cursor backup (to roll stuff back, e.g. unshuffle)
    playerStatus      : 'stop', // Player status
    notifications     :  [],    // The array of notifications
    refreshingLibrary :  false, // If the app is currently refreshing the app
    repeat            :  false, // the current repeat state (one, all, false)
    shuffle           :  false, // If shuffle mode is enabled
    refreshProgress   :  0,     // Progress of the refreshing library

    getStore: function() {
        return {
            config            : app.config.getAll(),
            notifications     : this.notifications,
            library           : this.library,
            tracks            : this.tracks,
            queue             : this.queue,
            queueCursor       : this.queueCursor,
            playerStatus      : this.playerStatus,
            notifications     : this.notifications,
            refreshingLibrary : this.refreshingLibrary,
            repeat            : this.repeat,
            shuffle           : this.shuffle,
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
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_REFRESH_CONFIG):
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_SELECT_AND_PLAY):

            var queue       = AppStore.tracks.slice();
            var id          = payload.id;
            var queueCursor = payload.id;
            var oldQueue    = queue;

            var uri = utils.parseURI(queue[id].path);
                app.audio.src = uri;
                app.audio.play();

            // Check if we have to shuffle the queue
            if(AppStore.shuffle) {

                var firstTrack = queue[id];

                queue.splice(id, 1);

                var m = queue.length, t, i;
                while (m) {

                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = queue[m];
                    queue[m] = queue[i];
                    queue[i] = t;
                }

                queue.unshift(firstTrack);

                // Let's set the cursor to 0
                queueCursor = 0;
            }

            // Backup that and change the UI
            AppStore.playerStatus   = 'play';
            AppStore.queue          =  queue;
            AppStore.queueCursor    =  queueCursor;
            AppStore.oldQueue       =  queue;
            AppStore.oldQueueCursor =  queueCursor;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_FILTER_SEARCH):

            var search = utils.stripAccents(payload.search);

            var library = AppStore.library;
            var tracks  = [];

            for(var i = 0; i < library.length; i++) {

                var track = library[i];

                if(search != '' && search != undefined) {

                    if(utils.stripAccents(track.loweredMetas.artist.join(', ')).indexOf(search) === -1
                        && utils.stripAccents(track.album.toLowerCase()).indexOf(search) === -1
                        && utils.stripAccents(track.loweredMetas.genre.join(', ')).toLowerCase().indexOf(search) === -1
                        && utils.stripAccents(track.title.toLowerCase().indexOf(search) === -1)) {

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
            if(app.audio.paused && AppStore.queue !== null) {
                AppStore.playerStatus = 'play';
                app.audio.play();
            } else {
                AppStore.playerStatus = 'pause';
                app.audio.pause();
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_PLAY):
            if(AppStore.queue !== null) {
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
            AppStore.library        =  null;
            AppStore.tracks         =  null;
            AppStore.queue          =  [];
            AppStore.queueCursor    =  null;
            AppStore.oldQueueCursor =  null;
            AppStore.playerStatus   = 'stop'
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_NEXT):

            var queue = AppStore.queue;

            if(AppStore.repeat === 'one') {
                newQueueCursor = AppStore.queueCursor;
            } else if (
                AppStore.repeat === 'all' &&
                AppStore.queueCursor === queue.length - 1 // is last track
            ) {
                newQueueCursor = 0; // start with new track
            } else {
                var newQueueCursor  = AppStore.queueCursor + 1;
            }


            if (queue[newQueueCursor] !== undefined) {
                var uri = utils.parseURI(queue[newQueueCursor].path); ;
                app.audio.src = uri;
                app.audio.play();

                AppStore.queueCursor = newQueueCursor;

            } else {
                app.audio.pause();
                app.audio.src = '';
                AppStore.queue          =  [];
                AppStore.queueCursor    =  null;
                AppStore.oldQueueCursor =  null;
                AppStore.playerStatus   = 'stop'
                AppStore.emit(CHANGE_EVENT);
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_PREVIOUS):
            if (app.audio.currentTime < 5) {

                var newQueueCursor = AppStore.queueCursor - 1;

            } else {

                var newQueueCursor = AppStore.queueCursor
            }

            var newTrack = AppStore.queue[newQueueCursor];

            if (newTrack !== undefined) {

                var uri = utils.parseURI(newTrack.path);
                app.audio.src = uri;

                app.audio.play();

                AppStore.queueCursor = newQueueCursor;

            } else {
                app.audio.pause();
                app.audio.src = '';
                AppStore.queue          =  [];
                AppStore.queueCursor    =  null;
                AppStore.oldQueueCursor =  null;
                AppStore.playerStatus   = 'stop'
                AppStore.emit(CHANGE_EVENT);
            }
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_PLAYER_SHUFFLE):

            if(!AppStore.shuffle) {

                AppStore.oldQueue       = AppStore.queue;
                AppStore.oldQueueCursor = AppStore.oldQueueCursor;

                // Let's shuffle that
                var queueCursor = AppStore.queueCursor;
                var queue       = AppStore.queue.slice();

                var firstTrack = queue[queueCursor]; // Get the current track

                queue = queue.splice(queueCursor + 1, AppStore.queue.length - (queueCursor + 1)); // now get only what we want

                var m = queue.length, t, i;
                while (m) {

                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = queue[m];
                    queue[m] = queue[i];
                    queue[i] = t;
                }

                queue.unshift(firstTrack); // Add the current track at the first position

                AppStore.shuffle           = true;
                AppStore.queue          = queue;
                AppStore.queueCursor    = 0;
                AppStore.oldQueueCursor = queueCursor;

            } else {

                AppStore.queue       = AppStore.oldQueue;
                AppStore.queueCursor = AppStore.oldQueueCursor;
                AppStore.shuffle     = false;

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

        case(AppConstants.APP_QUEUE_PLAY):

            var queue       = AppStore.queue.slice();
            var queueCursor = payload.index;

            var uri = utils.parseURI(queue[queueCursor].path);
                app.audio.src = uri;
                app.audio.play();

            // Backup that and change the UI
            AppStore.playerStatus   = 'play';
            AppStore.queue          =  queue;
            AppStore.queueCursor    =  queueCursor;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_CLEAR):
            AppStore.queue.splice(AppStore.queueCursor + 1, AppStore.queue.length - AppStore.queueCursor);
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_REMOVE):
            AppStore.queue.splice(AppStore.queueCursor + payload.index + 1, 1)
            AppStore.emit(CHANGE_EVENT);
            break;

        // Prob here
        case(AppConstants.APP_QUEUE_ADD):
            var selected = payload.selected;
            var tracks   = AppStore.tracks;

            for(var i = 0, length = tracks.length; i < length; i++) {
                if(selected.indexOf(tracks[i]._id) > -1) {
                    AppStore.queue.push(tracks[i]);
                }
            }

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_ADD_NEXT):
            var selected = payload.selected;
            var tracks   = AppStore.tracks;
            var cursor   = AppStore.queueCursor;

            for(var i = 0, length = tracks.length; i < length; i++) {
                if(selected.indexOf(tracks[length - i - 1]._id) > -1) {
                    AppStore.queue.splice(cursor + 1, 0, tracks[length - i - 1]);
                }
            }

            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_QUEUE_SET_QUEUE):
            AppStore.queue = payload.queue;
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_LIBRARY_ADD_FOLDERS):

            var musicFolders = app.config.get('musicFolders'),
                folders      = payload.folders;

            // Check if we reveived folders
            if(folders !== undefined) {
                // Add folders
                folders.forEach((folder) => {
                    musicFolders.push(fs.realpathSync(folder));
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

        case(AppConstants.APP_NOTIFICATION_ADD):
            AppStore.notifications.push(payload.notification);
            AppStore.emit(CHANGE_EVENT);
            break;

        case(AppConstants.APP_NOTIFICATION_REMOVE):
            AppStore.notifications = AppStore.notifications.filter((elem) => {
                return elem._id !== payload._id;
            });
            AppStore.emit(CHANGE_EVENT);
            break;
    }
});
