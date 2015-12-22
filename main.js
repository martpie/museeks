process.env.NODE_ENV = 'production'; // Drastically increase performances

var path     = require('path'),
    teeny    = require('teeny-conf'),
    electron = require('electron');

var app           = electron.app,           // Module to control application life.
    BrowserWindow = electron.BrowserWindow; // Module to create native browser window.



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

    var bounds = conf.get('bounds');

    // Browser Window options
    var mainWindowOption = {
        x         :  bounds.x,
        y         :  bounds.y,
        width     :  bounds.width,
        height    :  bounds.height,
        minWidth  :  1000,
        minHeight :  600,
        frame     :  false,
        title     : 'Museeks',
        show      :  true
    };

    // Create the browser window
    mainWindow = new BrowserWindow(mainWindowOption);

    // ... and load our html page
    mainWindow.loadURL('file://' + __dirname + '/src/app.html');

    mainWindow.on('closed', function() {
        // Dereference the window object
        mainWindow = null;
    });
});
