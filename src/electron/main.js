process.env.NODE_ENV = 'production'; // Drastically increase performances

import path from 'path';
import os from 'os';
import electron from 'electron';
import { nativeImage, app } from 'electron';

import database from './database';
import store from './redux/store';                     // Redux store
import initLib from './lib';                           // Shared library configuration
import initApi from './api';                           // API configuration
import initElectron from './init';                     // Electron bootstrap
import TrayManager from './tray';                      // Manages Tray
import ConfigManager from './config';                  // Handles config
import { RpcIpcManager } from 'electron-simple-rpc';   // Handles RPC IPC Events
import PowerMonitor from './power-monitor';            // Handle power events
import IntegrationManager from './integration';        // Applies various integrations

import initMainWindow from './windows/initMainWindow';
import getIcons from './other/getIcons';

import PeerDiscoveryManager from './peer-discovery';

const appRoot = path.resolve(__dirname, '../..'); // app/ directory
const srcPath = path.join(appRoot, 'src');        // app/src/ directory

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

    // Initialise shared libraries with the store
    const lib = initLib(store);

    // Get the config
    const configManager = new ConfigManager(app);
    const config = configManager.getConfig();

    // Load configuration into the store
    store.dispatch(lib.actions.config.load(config));
    lib.actions.network.peerFound({ ip : 'jackson' });

    // Get the application icons
    const museeksIcons = getIcons(appRoot);

    // Create and load the main window
    mainWindow = initMainWindow(museeksIcons, config, srcPath);

    // Init Electron
    initElectron(lib);

    // Start the API server
    initApi(lib);

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
