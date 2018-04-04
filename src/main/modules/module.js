/**
 * Example of Module, other modules should extent this class
 */

const os = require('os');


class Module {
  constructor() {
    this.loaded = false;
    this.platforms = ['win32', 'linux', 'darwin'];
  }

  getConfig() {
    return this.config;
  }

  // To not be overriden
  init() {
    if (this.loaded) throw(new TypeError('Module is already loaded'));

    if (this.platforms.includes(os.platform())) {
      this.load();
      this.loaded = true;
    } else {
      console.info(`[INFO] Skipping load of ${this.constructor.name}`);
    }
  }

  load() {
    throw(new TypeError('Module should have a load() method'));
    // Do whatever you want here :)
  }
}

module.exports = Module;
