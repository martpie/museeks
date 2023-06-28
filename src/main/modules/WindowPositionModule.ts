/**
 * Module in charge of remembering the window position, width and height
 */

import type Store from 'electron-store';
import debounce from 'lodash/debounce';

import { Config } from '../../shared/types/museeks';

import ModuleWindow from './BaseWindowModule';

export default class WindowPositionModule extends ModuleWindow {
  protected config: Store<Config>;

  constructor(window: Electron.BrowserWindow, config: Store<Config>) {
    super(window);
    this.config = config;
  }

  async load(): Promise<void> {
    this.window.on('resize', debounce(this.saveBounds, 250).bind(this));
    this.window.on('move', debounce(this.saveBounds, 250).bind(this));
  }

  saveBounds() {
    const bounds = this.window.getBounds();
    this.config.set('bounds', bounds);
  }
}
