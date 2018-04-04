/**
 * Example of Module, other modules should extent this class
 */

const Module = require('./module');


class ModuleWindow extends Module {
  constructor(window) {
    super();

    if (!window || typeof window !== 'object') {
      throw(new TypeError('ModuleWindow expecs a valid BrowserWindow to be passed as argument'));
    }

    this.window = window;
  }
}

module.exports = ModuleWindow;
