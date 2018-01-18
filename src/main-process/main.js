'use strict';

const path     = require('path');
const os       = require('os');
const electron = require('electron');

const IpcManager         = require('./ipc'); // Manages IPC evens
const TrayManager        = require('./tray'); // Manages Tray
const ConfigManager      = require('./config'); // Handles config
const PowerMonitor       = require('./power-monitor'); // Handle power events
const IntegrationManager = require('./integration'); // Applies various integrations

const app           = electron.app; // Module to control application life.
const nativeImage   = electron.nativeImage;
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.

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
    mainWindow.show();
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
  const config = configManager.getConfig();
  const { useNativeFrame } = config;
  let { bounds } = config;

  bounds = checkBounds(bounds);

  const logosPath = path.join(appRoot, 'src', 'images', 'logos');
  const museeksIcons = {
    '256': nativeImage.createFromPath(path.join(logosPath, 'museeks.png')),
    '128': nativeImage.createFromPath(path.join(logosPath, 'museeks-128.png')),
    '64': nativeImage.createFromPath(path.join(logosPath, 'museeks-64.png')),
    '48': nativeImage.createFromPath(path.join(logosPath, 'museeks-48.png')),
    '32': nativeImage.createFromPath(path.join(logosPath, 'museeks-32.png')),
    'ico': nativeImage.createFromPath(path.join(logosPath, 'museeks.ico')),
    'tray': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.png')).resize({ width: 24, height: 24 }),
    'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.ico')),
  };


    // Browser Window options
  const mainWindowOptions = {
    title     : 'Museeks',
    icon      :  os.platform() === 'win32' ? museeksIcons['ico'] : museeksIcons['256'],
    x         :  bounds.x,
    y         :  bounds.y,
    width     :  bounds.width,
    height    :  bounds.height,
    minWidth  :  900,
    minHeight :  550,
    frame     :  useNativeFrame,
    show      :  false,

  };

  if (os.platform() === 'darwin' && !useNativeFrame) {
    mainWindowOptions.titleBarStyle = 'hiddenInset';
  }

  // Create the browser window
  mainWindow = new BrowserWindow(mainWindowOptions);

  // ... and load our html page
  mainWindow.loadURL(`file://${srcPath}/app.html#/library`);

  // Open dev tools if museeks is run in edbug mode
  if (process.argv.includes('--enable-logging')) mainWindow.openDevTools();

  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Click on the dock icon to show the app again on macOS
  app.on('activate', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Prevent webContents from opening new windows (e.g ctrl-click on link)
  mainWindow.webContents.on('new-window', (e) => {
    e.preventDefault();
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


/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/

function checkBounds(bounds) {
  // check if the browser window is offscreen
  const display = electron.screen.getDisplayNearestPoint(bounds).workArea;

  const onScreen = bounds.x >= display.x
        && bounds.x + bounds.width <= display.x + display.width
        && bounds.y >= display.y
        && bounds.y + bounds.height <= display.y + display.height;

  if(!onScreen) {
    delete bounds.x;
    delete bounds.y;
    bounds.width = 900;
    bounds.height = 550;
  }

  return bounds;
}
