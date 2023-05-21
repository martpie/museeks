/**
 * Module in charge of remembering the window position, width and height
 */

import { performance } from 'perf_hooks';

import TeenyConf from 'teeny-conf';

import { Config } from '../../shared/types/museeks';

import ModuleWindow from './module-window';

export default class WindowPositionModule extends ModuleWindow {
  protected config: TeenyConf<Config>;
  protected lastSaveBounds = 0;
  protected saveBoundsTimeout: NodeJS.Timeout | null = null;

  constructor(window: Electron.BrowserWindow, config: TeenyConf<Config>) {
    super(window);
    this.config = config;
  }

  async load(): Promise<void> {
    this.window.on('resize', this.saveBounds);
    this.window.on('move', this.saveBounds);
  }

  saveBounds() {
    const now = performance.now();

    if (now - this.lastSaveBounds < 250 && this.saveBoundsTimeout) {
      clearTimeout(this.saveBoundsTimeout);
    }

    this.lastSaveBounds = now;

    this.saveBoundsTimeout = setTimeout(async () => {
      const bounds = this.window.getBounds();

      this.config.set('bounds', bounds);
      this.config.save();
    }, 250);
  }
}
