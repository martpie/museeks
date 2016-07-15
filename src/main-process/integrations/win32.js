const path = require('path');
const { nativeImage, ipcMain } = require('electron');

const iconsDirectory = path.resolve(__dirname, '../..', 'images', 'icons', 'windows');

class Win32Integration {

    constructor(win) {
        this.window = win;
        this.thumbarButtons = {
            play: {
                tooltip: 'Play',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'play');
                }
            },
            pause: {
                tooltip: 'Pause',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'pause');
                }
            },
            prev: {
                tooltip: 'Prev',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'backward.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'prev');
                }
            },
            next: {
                tooltip: 'Next',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'forward.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'next');
                }
            }
        };
    }

    enable() {

        ipcMain.on('appReady', () => {
            this.window.setThumbarButtons([
                this.thumbarButtons.prev,
                this.thumbarButtons.play,
                this.thumbarButtons.next,
            ]);
        });

        ipcMain.on('playerAction', (event, arg) => {
            switch(arg) {
                case 'play':
                    this.window.setThumbarButtons([
                        this.thumbarButtons.prev,
                        this.thumbarButtons.pause,
                        this.thumbarButtons.next,
                    ]);
                    break;
                case 'pause':
                    this.window.setThumbarButtons([
                        this.thumbarButtons.prev,
                        this.thumbarButtons.play,
                        this.thumbarButtons.next,
                    ]);
                    break;
            }
        });
    }
}

module.exports = Win32Integration;
