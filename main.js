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
        width: 1100,
        height: 650,
        frame: false
    };

    mainWindow = new BrowserWindow(mainWindowOption);

    mainWindow.loadUrl('file://' + __dirname + '/src/index.html');
    mainWindow.show();
    mainWindow.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
