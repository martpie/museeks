/**
 * Example of Module, other modules should extent this class
 */

import Module from './module';

class ModuleWindow extends Module {
  protected window: Electron.BrowserWindow;

  constructor(window: Electron.BrowserWindow) {
    super();
    this.window = window;
  }

  getWindow(): Electron.BrowserWindow {
    return this.window;
  }
}

export default ModuleWindow;
