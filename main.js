'use strict';

process.env.NODE_ENV = 'production'; // Drastically increase performances

const path     = require('path');
const teeny    = require('teeny-conf');
const electron = require('electron');

const app              = electron.app;              // Module to control application life.
const BrowserWindow    = electron.BrowserWindow;    // Module to create native browser window.
const ipcMain          = electron.ipcMain;          // Communication with the renderer process
const Menu             = electron.Menu;             // Chromium menu API
const powerSaveBlocker = electron.powerSaveBlocker; // Sleep mode management


var instance = {}; // use to keep some variables in mind



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed
app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

    var screen = electron.screen; // Module to get screen size
    var pathUserData = app.getPath('userData');

    // Config related stuff
    var workArea = screen.getPrimaryDisplay().workArea;

    var defaultConfig = {
        theme: 'light',
        volume: 1,
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

    var conf = teeny.loadOrCreateSync(path.join(pathUserData, 'config.json'), defaultConfig);

    // Check if config update
    var configChanged = false;

    for(var key in defaultConfig) {
        if(conf.get(key) === undefined) {
            conf.set(key, defaultConfig[key]);
            configChanged = true;
        }
    }

    // save config if changed
    if(configChanged) conf.saveSync();

    var bounds       = conf.get('bounds');
    var sleepBlocker = conf.get('sleepBlocker');

    // Sleep Blocker
    if(sleepBlocker) {
        instance.sleepBlockerID = powerSaveBlocker.start('prevent-app-suspension');
    }

    // Browser Window options
    var mainWindowOption = {
        title     : 'Museeks',
        icon      : './src/images/logos/museeks.png',
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
    ipcMain.on('artistListContextMenu', (event, items) => {

        var template = [
            {
                label: items > 1 ? items + ' tracks selected' : items + ' track selected',
                enabled: false
            },
            {
                type: 'separator'
            },
            {
                label : 'Add to queue',
                click :  function() {
                    event.sender.send('artistListContextMenuReply', 'addToQueue');
                }
            },
            {
                label : 'Play next',
                click :  function() {
                    event.sender.send('artistListContextMenuReply', 'playNext');
                }
            }
        ];

        var context = Menu.buildFromTemplate(template);

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
