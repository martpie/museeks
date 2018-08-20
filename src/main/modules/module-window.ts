/**
 * Example of Module, other modules should extent this class
 */

import Module from './module';

class ModuleWindow extends Module {
  protected window: Electron.BrowserWindow;

  constructor (window: Electron.BrowserWindow) {
    super();

    if (!window || typeof window !== 'object') {
      throw (new TypeError('ModuleWindow expecs a valid BrowserWindow to be passed as argument'));
    }

    this.window = window;
  }

  getWindow () {
    return this.window;
  }
}

export default ModuleWindow;
