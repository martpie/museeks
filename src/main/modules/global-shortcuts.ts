/**
 * Module in charge of registering global shortcuts
 */

import { globalShortcut } from 'electron';

import messages from '../../shared/lib/ipc-messages';
import ModuleWindow from './module-window';

class GlobalShortcutsModule extends ModuleWindow {
  async load(): Promise<void> {
    globalShortcut.register('MediaPlayPause', () => {
      this.window.webContents.send(messages.PLAYBACK_PLAYPAUSE);
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      this.window.webContents.send(messages.PLAYBACK_PREVIOUS);
    });

    globalShortcut.register('MediaNextTrack', () => {
      this.window.webContents.send(messages.PLAYBACK_NEXT);
    });
  }
}

export default GlobalShortcutsModule;
