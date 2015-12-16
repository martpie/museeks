process.env.NODE_ENV = 'production'; // Drastically increase performances

var app           = require('app');            // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.

require('crash-reporter').start(); // Report crashes to our server.

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

    // Browser Window options
    var mainWindowOption = {
        'width'      :  1000,
        'height'     :  600,
        'min-width'  :  1000,
        'min-height' :  600,
        'frame'      :  false,
        'title'      : 'Museeks',
        'show'       :  false
    };

    // Create the browser window
    mainWindow = new BrowserWindow(mainWindowOption);

    // ... and load our html page
    mainWindow.loadURL('file://' + __dirname + '/src/app.html');
    mainWindow.openDevTools();

    mainWindow.on('closed', function() {
        // Dereference the window object
        mainWindow = null;
    });
});
