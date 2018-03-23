/**
 * Example of Module, other modules should extent this class
 */

const constants = require('../constants');


class Module {
  static get PLATFORMS() {
    return ['win32', 'linux', 'darwin'];
  }

  static get LOAD_AT() {
    return constants.ON_BROWSERWINDOW_READY;
  }

  constructor(window) {
    this.window = window;
    this.isLoaded = false;
  }

  getConfig() {
    return this.config;
  }

  // To not be overriden
  init() {
    if (this.isLoaded) throw(new TypeError('Module is already loaded'));

    this.load();
    this.isLoaded = true;
  }

  load() {
    throw(new TypeError('Module should have a load() method'));
    // Do whatever you want here :)
  }
}

module.exports = Module;
