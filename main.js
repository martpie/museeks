var app           = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;


app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});


app.on('ready', function() {

    var mainWindowOption = {
        'width'      : 1000,
        'height'     : 600,
        'min-width'  : 1000,
        'min-height' : 600,
        'frame'      : true
    };

    mainWindow = new BrowserWindow(mainWindowOption);

    mainWindow.loadUrl('file://' + __dirname + '/src/index.html');
    mainWindow.show();
    mainWindow.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
