/**
 * Module in charge of registering global shortcuts
 */

import { globalShortcut } from 'electron';
import ModuleWindow from './module-window';

class GlobalShortcutsModule extends ModuleWindow {
  async load () {
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

export default GlobalShortcutsModule;
