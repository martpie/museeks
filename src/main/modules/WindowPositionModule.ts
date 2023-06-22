/**
 * Module in charge of remembering the window position, width and height
 */

import TeenyConf from 'teeny-conf';
import debounce from 'lodash/debounce';

import { Config } from '../../shared/types/museeks';

import ModuleWindow from './BaseWindowModule';

export default class WindowPositionModule extends ModuleWindow {
  protected config: TeenyConf<Config>;

  constructor(window: Electron.BrowserWindow, config: TeenyConf<Config>) {
    super(window);
    this.config = config;
  }

  async load(): Promise<void> {
    this.window.on('resize', debounce(this.saveBounds, 250));
    this.window.on('move', debounce(this.saveBounds, 250));
  }

  saveBounds() {
    const bounds = this.window.getBounds();

    this.config.set('bounds', bounds);
    this.config.save();
  }
}
