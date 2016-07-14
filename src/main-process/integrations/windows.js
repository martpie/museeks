const path = require('path');
const { nativeImage, ipcMain } = require('electron');

const iconsDirectory = path.resolve(__dirname, '../..', 'images', 'icons', 'windows');

class WindowsIntegration {
    constructor(win) {
      this.window = win;
      this.thumbarButtons = {
          prev: {
              tooltip: 'Prev',
              icon: this.createIcon('backward.ico'),
              click() {
                  console.log('Prev clicked');
              }
          },
          pause: {
              tooltip: 'Pause',
              icon: this.createIcon('pause.ico'),
              click() {
                  console.log('Pause clicked');
              }
          },
          play: {
              tooltip: 'Play',
              icon: this.createIcon('pause.ico'),
              click() {
                  console.log('Play clicked');
              }
          },
          next: {
            tooltip: 'Next',
            icon: this.createIcon('forward.ico'),
            click() {
                console.log('Next clicked');
            }
          }
      };
    }

    createIcon(name) {
      return nativeImage.createFromPath(path.join(iconsDirectory, name));
    }

    enable() {
        ipcMain.on('appReady', () => {
            this.window.setThumbarButtons([
              this.thumbarButtons.prev,
              this.thumbarButtons.pause,
              this.thumbarButtons.next,
            ]);
        });
    }
}

module.exports = WindowsIntegration;
