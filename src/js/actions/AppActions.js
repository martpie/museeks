import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../constants/app.js';

import mmd      from 'musicmetadata';
import fs       from 'fs';
import path     from 'path';
import mime     from 'mime';
import walkSync from 'walk-sync';

const globalShortcut = electron.remote.globalShortcut;
const dialog         = electron.remote.dialog;
const ipcRenderer    = electron.ipcRenderer;



var AppActions = {

    init: function() {

        // Usual tasks
        this.app.start();
        this.getTracks();
        this.settings.checkTheme();
        this.settings.checkDevMode();
        this.app.initShortcuts();

        // Prevent some events
        window.addEventListener('dragover', function (e) {
            e.preventDefault();
        }, false);

        window.addEventListener('drop', function (e) {
            e.preventDefault();
        }, false);

        // Remember dimensions and positionning
        var currentWindow = app.browserWindows.main;

        currentWindow.on('resize', function() {
            AppActions.app.saveBounds();
        });

        currentWindow.on('move', function() {
            AppActions.app.saveBounds();
        });
    },

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
    selectAndPlay: function(id) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_SELECT_AND_PLAY,
            id         : id
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

        start: function() {
            // nothing here anymore
        },

        close: function() {
            app.browserWindows.main.close();
        },

        minimize: function() {
            app.browserWindows.main.minimize();
        },

        maximize: function() {
            app.browserWindows.main.isMaximized() ? app.browserWindows.main.unmaximize() : app.browserWindows.main.maximize();
        },

        saveBounds: function() {

            var self = AppActions;
            var now = window.performance.now();

            if (now - self.lastFilterSearch < 250) {
                clearTimeout(self.filterSearchTimeOut);
            }

            self.lastFilterSearch = now;

            self.filterSearchTimeOut = setTimeout(() => {

                app.config.set('bounds', app.browserWindows.main.getBounds());
                app.config.saveSync();

            }, 250);
        },

        initShortcuts: function() {

            // Global shortcuts
            globalShortcut.register('MediaPlayPause', function () {
                AppActions.player.playToggle();
            });

            globalShortcut.register('MediaPreviousTrack', function () {
                AppActions.player.previous();
            });

            globalShortcut.register('MediaNextTrack', function () {
                AppActions.player.next();
            });
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
            app.config.set('volume', volume);
            app.config.saveSync();
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
                        AppActions.getTracks();
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

                                        delete metadata.picture;

                                        fs.realpath(file, (err, realpath) => {

                                            if(err) console.warn(err);

                                            metadata.path = realpath
                                            metadata.lArtist = metadata.artist.length === 0 ? ['unknown artist'] : metadata.artist[0].toLowerCase();

                                            if(metadata.artist.length === 0) metadata.artist = ['Unknown artist'];
                                            if(metadata.album === null || metadata.album === '') metadata.album = 'Unknown';
                                            if(metadata.title === null || metadata.title === '') metadata.title = path.parse(file).base;
                                            if(metadata.duration == '') metadata.duration = 0;

                                            app.db.find({ path: metadata.path }, function (err, docs) {
                                                if(err) console.warn(err);
                                                if(docs.length === 0) { // Track is not already in database
                                                    // Let's insert in the data
                                                    app.db.insert(metadata, function (err, newDoc) {
                                                        if(err) console.warn(err);
                                                        if(i === filesListFiltered.length - 1) {
                                                            AppActions.getTracks();
                                                            AppDispatcher.dispatch({
                                                                actionType : AppConstants.APP_LIBRARY_REFRESH_END
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    if(i === filesListFiltered.length - 1) {
                                                        AppActions.getTracks();
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
    },

    settings: {

        checkTheme: function() {
            var themeName = app.config.get('theme');
            document.querySelector('body').classList.add('theme-' + themeName);
        },

        toggleDarkTheme: function() {

            var oldTheme = app.config.get('theme');
            var newTheme = oldTheme === 'light' ? 'dark' : 'light';

            document.querySelector('body').classList.remove('theme-' + oldTheme);
            document.querySelector('body').classList.add('theme-' + newTheme);

            app.config.set('theme', newTheme);
            app.config.saveSync();

            AppDispatcher.dispatch({
                actionType : AppConstants.APP_REFRESH_CONFIG
            });
        },

        checkDevMode: function() {
            if(app.config.get('devMode')) app.browserWindows.main.openDevTools();
        },

        toggleSleepBlocker: function(mode) {

            app.config.set('sleepBlocker', !app.config.get('sleepBlocker'));
            app.config.saveSync();

            ipcRenderer.send('toggleSleepBlocker', app.config.get('sleepBlocker'), mode);

            AppDispatcher.dispatch({
                actionType : AppConstants.APP_REFRESH_CONFIG
            });
        },

        toggleDevMode: function() {

            app.config.set('devMode', !app.config.get('devMode'));

            // Open dev tools if needed
            if(app.config.get('devMode')) app.browserWindows.main.openDevTools();
            else app.browserWindows.main.closeDevTools();

            app.config.saveSync();

            AppDispatcher.dispatch({
                actionType : AppConstants.APP_REFRESH_CONFIG
            });
        },

        refreshProgress: function(percentage) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_LIBRARY_REFRESH_PROGRESS,
                percentage : percentage
            });
        }
    }
};

export default AppActions;
