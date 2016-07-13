const path = require('path');
const { nativeImage, ipcMain } = require('electron');

class WindowsIntegration {
    constructor(win) {
      this.window = win;
    }

    enable() {
        ipcMain.on('appReady', () => {
            this.window.setThumbarButtons([
              {
                tooltip: 'Prev',
                icon: nativeImage.createEmpty(),
                click() {
                    console.log('Prev clicked');
                }
              },
              {
                tooltip: 'Pause/Play',
                icon: nativeImage.createEmpty(),
                click() {
                    console.log('Pause/Play clicked');
                }
              },
              {
                tooltip: 'Next',
                icon: nativeImage.createEmpty(),
                click() {
                    console.log('Next clicked');
                }
              }
            ]);
        });
    }
}

module.exports = WindowsIntegration;
