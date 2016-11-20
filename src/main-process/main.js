'use strict';

process.env.NODE_ENV = 'production'; // Drastically increase performances

const path     = require('path');
const os       = require('os');
const electron = require('electron');

const IpcManager         = require('./ipc');             // Manages IPC evens
const TrayManager        = require('./tray');            // Manages Tray
const ConfigManager      = require('./config');          // Handles config
const PowerMonitor       = require('./power-monitor');   // Handle power events
const IntegrationManager = require('./integration');     // Applies various integrations

const app           = electron.app;              // Module to control application life.
const nativeImage   = electron.nativeImage;
const BrowserWindow = electron.BrowserWindow;    // Module to create native browser window.

const appRoot = path.resolve(__dirname, '../..'); // app/ directory
const srcPath = path.join(appRoot, 'src'); // app/src/ directory

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

// Make the app a single-instance app (to avoid Database concurrency)
const shouldQuit = app.makeSingleInstance(() => {
    // Someone tried to run a second instance, we should focus our window.
    if(mainWindow) {
        if(mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

if (shouldQuit) {
    app.quit();
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {

    const configManager = new ConfigManager(app);
    const { bounds, useNativeFrame } = configManager.getConfig();

    const logosPath = path.join(appRoot, 'src', 'images', 'logos');
    const museeksIcons = {
        '256': nativeImage.createFromPath(path.join(logosPath, 'museeks.png')),
        '128': nativeImage.createFromPath(path.join(logosPath, 'museeks-128.png')),
        '64': nativeImage.createFromPath(path.join(logosPath, 'museeks-64.png')),
        '48': nativeImage.createFromPath(path.join(logosPath, 'museeks-48.png')),
        '32': nativeImage.createFromPath(path.join(logosPath, 'museeks-32.png')),
        'ico': nativeImage.createFromPath(path.join(logosPath, 'museeks.ico')),
        'tray': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.png')).resize({ width: 24, height: 24 }),
        'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.ico'))
    };

    // Browser Window options
    const mainWindowOption = {
        title     : 'Museeks',
        icon      :  os.platform() === 'win32' ? museeksIcons['ico'] : museeksIcons['256'],
        x         :  bounds.x,
        y         :  bounds.y,
        width     :  bounds.width,
        height    :  bounds.height,
        minWidth  :  900,
        minHeight :  550,
        frame     :  useNativeFrame,
        show      :  false
    };

    // Create the browser window
    mainWindow = new BrowserWindow(mainWindowOption);

    // ... and load our html page
    mainWindow.loadURL(`file://${srcPath}/app.html#/library`);

    mainWindow.on('closed', () => {
        // Dereference the window object
        mainWindow = null;
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });

    // IPC events
    const ipcManager = new IpcManager(mainWindow);
    ipcManager.bindEvents();

    // Power monitor
    const powerMonitor = new PowerMonitor(mainWindow);
    powerMonitor.enable();

    // Tray manager
    const trayIcon = os.platform() === 'win32.' ? museeksIcons['tray-ico'] : museeksIcons['tray'];
    const trayManager = new TrayManager(mainWindow, trayIcon);
    trayManager.bindEvents();
    trayManager.show();

    // integrations
    const integrations = new IntegrationManager(mainWindow);
    integrations.enable();
});
