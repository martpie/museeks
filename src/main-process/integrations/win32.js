'use strict';

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
            playDisabled: {
                tooltip: 'Play',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play-disabled.ico'))
            },
            pause: {
                tooltip: 'Pause',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'pause');
                }
            },
            pauseDisabled: {
                tooltip: 'Pause',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause-disabled.ico'))
            },
            prev: {
                tooltip: 'Prev',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'backward.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'prev');
                }
            },
            prevDisabled: {
                tooltip: 'Prev',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'backward-disabled.ico'))
            },
            next: {
                tooltip: 'Next',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'forward.ico')),
                click: () => {
                    win.webContents.send('playerAction', 'next');
                }
            },
            nextDisabled: {
                tooltip: 'Next',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'forward-disabled.ico'))
            }
        };
    }

    enable() {

        ipcMain.on('appReady', () => {
            this.window.setThumbarButtons([
                this.thumbarButtons.prevDisabled,
                this.thumbarButtons.playDisabled,
                this.thumbarButtons.nextDisabled,
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
                case 'stop':
                    this.window.setThumbarButtons([
                        this.thumbarButtons.prevDisabled,
                        this.thumbarButtons.playDisabled,
                        this.thumbarButtons.nextDisabled,
                    ]);
                    break;
            }
        });
    }
}

module.exports = Win32Integration;
