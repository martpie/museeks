process.env.NODE_ENV = 'production'; // Drastically increase performances

import path from 'path';
import os from 'os';
import electron from 'electron';

import database from './database';
import lib from './lib';                               // Library containing app logic
import store from './redux/store';                     // Redux store
import configureApi from './api';                      // API configuration
import TrayManager from './tray';                      // Manages Tray
import ConfigManager from './config';                  // Handles config
import { RpcIpcManager } from 'electron-simple-rpc';   // Handles RPC IPC Events
import PowerMonitor from './power-monitor';            // Handle power events
import IntegrationManager from './integration';        // Applies various integrations

import init from './init';
import initMainWindow from './windows/initMainWindow';
import getIcons from './other/getIcons';

import PeerDiscoveryManager from './peer-discovery';

const appRoot = path.resolve(__dirname, '../..'); // app/ directory
const srcPath = path.join(appRoot, 'src');        // app/src/ directory

const { nativeImage, app } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

// Make the app a single-instance app (to avoid Database concurrency)
const shouldQuit = app.makeSingleInstance(() => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
});

lib.actions.network.peerFound({ ip : 'jackson' })

if (shouldQuit) {
    app.quit();
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {
    // Get the config
    const configManager = new ConfigManager(app);
    const config = configManager.getConfig();

<<<<<<< HEAD
    const desiredBounds = config.bounds;
    const bounds = checkBounds(desiredBounds);

    const logosPath = path.join(appRoot, 'src', 'images', 'logos');
    const museeksIcons = {
        '256': nativeImage.createFromPath(path.join(logosPath, 'museeks.png')),
        '128': nativeImage.createFromPath(path.join(logosPath, 'museeks-128.png')),
        '64': nativeImage.createFromPath(path.join(logosPath, 'museeks-64.png')),
        '48': nativeImage.createFromPath(path.join(logosPath, 'museeks-48.png')),
        '32': nativeImage.createFromPath(path.join(logosPath, 'museeks-32.png')),
        'ico': nativeImage.createFromPath(path.join(logosPath, 'museeks.ico')),
        'tray': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.png')).resize({ width: 24, height: 24 }),
        'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.ico')).resize({ width: 24, height: 24 })
    };

    // Browser Window options
    const mainWindowOption = {
        title: 'Museeks',
        icon: os.platform() === 'win32' ? museeksIcons['ico'] : museeksIcons['256'],
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        minWidth: 900,
        minHeight: 550,
        frame: config.useNativeFrame,
        show: false
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
    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow.webContents.send('close');
    });

    // Get the application icons
    const museeksIcons = getIcons(appRoot);

    // Create and load the main window
    mainWindow = initMainWindow(museeksIcons, config, srcPath);

    // Load configuration into the store
    store.dispatch(lib.actions.config.load(config));

    // Init electron
    init(store, lib);

    // Start the API server
    configureApi(store, lib);

    // Start listening for RPC IPC events
    const rpcIpcManager = new RpcIpcManager(lib, 'electron');

    // Start the peer discovery service
    const peers = new PeerDiscoveryManager(store, lib);

    // Power monitor
    const powerMonitor = new PowerMonitor(mainWindow, store);
    powerMonitor.enable();

    // Tray manager
    const trayIcon = os.platform() === 'win32.' ? museeksIcons['tray-ico'] : museeksIcons['tray'];
    const trayManager = new TrayManager(mainWindow, trayIcon, store);
    trayManager.bindEvents();
    trayManager.show();

    // integrations
    const integrations = new IntegrationManager(mainWindow);
    integrations.enable();
});
