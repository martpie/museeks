import { BrowserWindow, screen } from 'electron';
import extend from 'xtend';
import os from 'os';

export default (lib, icons, srcPath) => {

    const bounds = checkBounds(lib.store.getState().config.bounds);

    const mainWindowOption = {
        title: 'Museeks',
        icon: os.platform() === 'win32' ? icons['ico'] : icons['256'],
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        minWidth: 900,
        minHeight: 550,
        frame: lib.store.getState().config.useNativeFrame,
        show: false
    };

    // Create the browser window
    let mainWindow = new BrowserWindow(mainWindowOption);

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

  return mainWindow
}

function checkBounds(desiredBounds) {

    // capture the bounds of the user's screen
    const { width, height } = screen.getPrimaryDisplay().workArea;
    const screenBounds = {
        x: parseInt(width / 2),
        y: parseInt(height / 2)
    }
    const bounds = extend(screenBounds, desiredBounds);

    // check if the browser window is offscreen
    const display = screen.getDisplayNearestPoint(bounds).workArea;

    const onScreen = bounds.x >= display.x
        && bounds.x + bounds.width <= display.x + display.width
        && bounds.y >= display.y
        && bounds.y + bounds.height <= display.y + display.height;

    if (!onScreen) {
        delete bounds.x;
        delete bounds.y;
        bounds.width = 900;
        bounds.height = 550;
    }

    return bounds;
}
