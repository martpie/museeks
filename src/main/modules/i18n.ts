/**
 * Module in charge of giving back i18next resources to the renderer process
 */

import fs from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';

import channels from '../../shared/lib/ipc-channels';
import { LANGUAGES } from '../../shared/lib/languages';
import ConfigModule from './config';
import ModuleWindow from './module-window';

class I18nModule extends ModuleWindow {
  protected config: ConfigModule;

  constructor(window: Electron.BrowserWindow, config: ConfigModule) {
    super(window);

    this.config = config;
  }

  async load(): Promise<void> {
    console.log(app.getLocale(), app.getLocaleCountryCode());
    console.log('========================');
    const localesRoot = path.join(__dirname, '..', '..', 'locales');

    ipcMain.handle(channels.I18N_GET_RESOURCES, (_event) => {
      const resources: Record<string, string> = {};

      LANGUAGES.forEach((lang) => {
        resources[lang] = JSON.parse(fs.readFileSync(path.join(localesRoot, `${lang}.json`), { encoding: 'utf8' }));
      });

      return resources;
    });
  }
}

export default I18nModule;
