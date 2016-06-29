'use strict';

process.env.NODE_ENV = 'production'; // Drastically increase performances

const path     = require('path');
const teeny    = require('teeny-conf');
const electron = require('electron');

const app              = electron.app;              // Module to control application life.
const ipcMain          = electron.ipcMain;          // Communication with the renderer process
const powerSaveBlocker = electron.powerSaveBlocker; // Sleep mode management
const nativeImage      = electron.nativeImage;
const Menu             = electron.Menu;             // Chromium menu API
const BrowserWindow    = electron.BrowserWindow;    // Module to create native browser window.


let instance = {}; // use to keep some variables in mind



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

// Quit when all windows are closed
app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

    let screen = electron.screen; // Module to get screen size
    let pathUserData = app.getPath('userData');

    // Config related stuff
    let workArea = screen.getPrimaryDisplay().workArea;

    let defaultConfig = {
        theme: 'light',
        audioVolume: 1,
        audioPlaybackRate: 1,
        musicFolders: [],
        sleepBlocker: false,
        devMode: false,
        bounds: {
            width: 1000,
            height: 600,
            x: parseInt(workArea.width / 2),
            y: parseInt(workArea.height / 2)
        }
    }

    let conf = new teeny(path.join(pathUserData, 'config.json'));
    conf.loadOrCreateSync(defaultConfig);

    // Check if config update
    let configChanged = false;

    for(let key in defaultConfig) {
        if(conf.get(key) === undefined) {
            conf.set(key, defaultConfig[key]);
            configChanged = true;
        }
    }

    // save config if changed
    if(configChanged) conf.saveSync();

    let bounds       = conf.get('bounds');
    let sleepBlocker = conf.get('sleepBlocker');

    // Sleep Blocker
    if(sleepBlocker) {
        instance.sleepBlockerID = powerSaveBlocker.start('prevent-app-suspension');
    }

    let museeksIcon = nativeImage.createFromPath(path.join(__dirname, 'src', 'images', 'logos', 'museeks.png'));

    // Browser Window options
    let mainWindowOption = {
        title     : 'Museeks',
        icon      :  museeksIcon,
        x         :  bounds.x,
        y         :  bounds.y,
        width     :  bounds.width,
        height    :  bounds.height,
        minWidth  :  900,
        minHeight :  550,
        frame     :  false,
        show      :  false
    };

    // Create the browser window
    mainWindow = new BrowserWindow(mainWindowOption);

    // ... and load our html page
    mainWindow.loadURL('file://' + __dirname + '/src/app.html#/library');

    mainWindow.on('closed', function() {
        // Dereference the window object
        mainWindow = null;
    });

    // IPC events
    ipcMain.on('tracksListContextMenu', (event, items, playlists) => {

        let playlistTemplate;

        if(playlists === undefined) {
            playlistTemplate = [
                {
                    label: 'Create new playlist...',
                    click: function() {
                        event.sender.send('tracksListContextMenuReply', 'createPlaylist')
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'No playlist',
                    enabled: false
                }
            ]
        } else {
            playlistTemplate = [
                {
                    label: 'Create new playlist...',
                    click: function() {
                        event.sender.send('tracksListContextMenuReply', 'createPlaylist')
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'List playlists here',
                }
            ]
        }

        let template = [
            {
                label: items > 1 ? items + ' tracks selected' : items + ' track selected',
                enabled: false
            },
            {
                type: 'separator'
            },
            {
                label: 'Add to queue',
                click: function() {
                    event.sender.send('tracksListContextMenuReply', 'addToQueue');
                }
            },
            {
                label: 'Play next',
                click:  function() {
                    event.sender.send('tracksListContextMenuReply', 'playNext');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Add to playlist',
                submenu: playlistTemplate
            }
        ];

        let context = Menu.buildFromTemplate(template);

        context.popup(mainWindow); // Let it appear
    });


    ipcMain.on('toggleSleepBlocker', (event, toggle, mode) => {

        if(toggle) {
            instance.sleepBlockerID = powerSaveBlocker.start(mode);
        } else {
            powerSaveBlocker.stop(instance.sleepBlockerID);
            delete(instance.sleepBlockerID);
        }
    });


    ipcMain.on('appReady', (event, toggle, mode) => {
        mainWindow.show();
    });
});
