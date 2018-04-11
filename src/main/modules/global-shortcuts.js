/**
 * Module in charge of registering global shortcuts
 */

const { globalShortcut } = require('electron');
const ModuleWindow = require('./module-window');


class GlobalShortcutsModule extends ModuleWindow {
  constructor(window) {
    super(window);
  }

  load() {
    globalShortcut.register('MediaPlayPause', () => {
      this.window.webContents.send('playback:playpause');
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      this.window.webContents.send('playback:previous');
    });

    globalShortcut.register('MediaNextTrack', () => {
      this.window.webContents.send('playback:next');
    });
  }
}

module.exports = GlobalShortcutsModule;
