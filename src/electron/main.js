process.env.NODE_ENV = 'production'; // Drastically increase performances

import electron from 'electron';
import { nativeImage, app } from 'electron';
import path from 'path';
import os from 'os';
import extend from 'xtend';

import Database from './database';                     // Persistent data store
import store from './redux/store';                     // Redux store
import lib, { initLib } from './lib';                  // Shared library configuration
import ApiServer from './api';                         // HTTP API access to electorn and renderer
import initElectron from './init';                     // Electron bootstrap
import TrayManager from './tray';                      // Manages Tray
import { RpcIpcManager } from 'electron-simple-rpc';   // Handles RPC IPC Events
import PowerMonitor from './power-monitor';            // Handle power events
import IntegrationManager from './integration';        // Applies various integrations

import initMainWindow from './windows/initMainWindow';
import getIcons from './other/getIcons';

import PeerDiscoveryManager from './peer-discovery';

const appRoot = path.resolve(__dirname, '../..');      // app/ directory
const srcPath = path.join(appRoot, 'src');             // app/src/ directory

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

// Make the app a single-instance app (to avoid Database concurrency)
// const shouldQuit = app.makeSingleInstance(() => {
//     // Someone tried to run a second instance, we should focus our window.
//     if (mainWindow) {
//         if (mainWindow.isMinimized()) mainWindow.restore();
//         mainWindow.show();
//         mainWindow.focus();
//     }
// });

// if (shouldQuit) {
//     app.quit();
// }

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {

    // parse configuration from environment variables when in testing mode
    if (process.env.SPECTRON) {
        const config = JSON.parse(process.env.config);
        lib.config.setConfigPath(config.path);
        lib.config.extendConfig(config);
        lib.config.saveSync();
    }

    // Initialise shared libraries with the store
    initLib(store);

    // Load configuration required for the rest of the app to load into the store
    store.dispatch(lib.actions.config.load()).then((response) => {

        // Start the database
        const database = new Database(lib);
        database.start();

        // Start the API server
        const apiServer = new ApiServer(lib);
        apiServer.start();

        // Start listening for RPC IPC events
        const rpcIpcManager = new RpcIpcManager(lib, 'electron');

        // Start the peer discovery service
        const peers = new PeerDiscoveryManager(lib);

        // Power monitor
        const powerMonitor = new PowerMonitor(mainWindow, store);
        powerMonitor.enable();

        // Integrations
        const integrations = new IntegrationManager(mainWindow);
        integrations.enable();

        // Get the application icons
        const museeksIcons = getIcons(appRoot);

        // Tray manager
        const trayIcon = os.platform() === 'win32.' ? museeksIcons['tray-ico'] : museeksIcons['tray'];
        lib.tray = new TrayManager(mainWindow, trayIcon, store);
        lib.tray.show();

        // Create and load the main window
        mainWindow = initMainWindow(lib, museeksIcons, srcPath);

        // Init Electron
        initElectron(lib);
    });

// TODO: Add these to tray
//                case 'play': {
//                    this.setContextMenu('play');
//                    break;
//                }
//
//                case 'pause': {
//                    this.setContextMenu('pause');
//                    break;
//                }
//                case 'trackStart': {
//                    this.updateTrayMetadata(data);
//                    this.setContextMenu('play');
//                    break;
//                }
});
