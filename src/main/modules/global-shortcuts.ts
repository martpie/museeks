/**
 * Module in charge of registering global shortcuts
 */

import { globalShortcut } from 'electron';

import channels from '../../shared/lib/ipc-channels';
import ModuleWindow from './module-window';

class GlobalShortcutsModule extends ModuleWindow {
  async load(): Promise<void> {
    globalShortcut.register('MediaPlayPause', () => {
      this.window.webContents.send(channels.PLAYBACK_PLAYPAUSE);
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      this.window.webContents.send(channels.PLAYBACK_PREVIOUS);
    });

    globalShortcut.register('MediaNextTrack', () => {
      this.window.webContents.send(channels.PLAYBACK_NEXT);
    });
  }
}

export default GlobalShortcutsModule;
