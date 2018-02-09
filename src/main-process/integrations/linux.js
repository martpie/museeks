'use strict';

const path = require('path');
const ps = require('ps-node');
const { nativeImage } = require('electron');
const logosPath = path.resolve(__dirname, '../..', 'images', 'logos');

class LinuxIntegration {
  constructor(win) {
    this.window = win;
  }

  enable() {
    // detect gnome-shell process
    ps.lookup({
      command: 'gnome-shell',
    }, (err, resultList ) => {
      if (err) {
        throw new Error(err);
      }

      const trayIconPath = (this.window.appConfig.trayIcon === 'dark')
        ? path.join(logosPath, 'museeks-tray-dark.png')
        : path.join(logosPath, 'museeks-tray.png');

      resultList.forEach((process) => {
        if(process) {
          // set gnome-shell tray icon
          this.window.trayManager.updateTrayIcon(nativeImage.createFromPath(trayIconPath));
        }
      });
    });
  }
}

module.exports = LinuxIntegration;
