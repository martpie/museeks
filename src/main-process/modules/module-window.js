/**
 * Example of Module, other modules should extent this class
 */

const Module = require('./module');


class ModuleWindow extends Module {
  constructor(window) {
    super();
    this.window = window;
  }
}

module.exports = ModuleWindow;
