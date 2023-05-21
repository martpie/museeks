/**
 * Module in charge of telling the renderer process which native theme is used
 */

import { ipcMain, nativeTheme } from 'electron';
import TeenyConf from 'teeny-conf';

import channels from '../../shared/lib/ipc-channels';
import { themes } from '../../shared/lib/themes';
import { Config, Theme } from '../../shared/types/museeks';

import ModuleWindow from './module-window';

export default class NativeThemeModule extends ModuleWindow {
  protected config: TeenyConf<Config>;

  constructor(window: Electron.BrowserWindow, config: TeenyConf<Config>) {
    super(window);

    this.config = config;
  }

  async load(): Promise<void> {
    /**
     * Update the UI when someone changes the global theme settings
     */
    nativeTheme.on('updated', () => {
      if (this.getThemeId() === '__system') {
        this.applyTheme(this.getSystemThemeId());
      }

      // Otherwise, we don't care
    });

    ipcMain.handle(channels.THEME_GET_ID, () => this.getThemeId());

    /**
     * Handle themeSource update and returns the theme variables for a given
     * themeId
     */
    ipcMain.handle(channels.THEME_SET_ID, (_event, themeId: Config['theme']) => {
      this.setThemeId(themeId);
    });

    ipcMain.handle(channels.THEME_GET, () => {
      let themeId = this.getThemeId();

      if (themeId === '__system') themeId = this.getSystemThemeId();

      const theme = themes.find((theme) => theme._id === themeId);

      if (!theme) throw new RangeError(`No theme found with ID ${themeId}`);

      return theme;
    });
  }

  getThemeId(): Config['theme'] {
    return this.config.get('theme') ?? '__system';
  }

  setThemeId(themeId: Config['theme']): void {
    this.config.set('theme', themeId);
    this.config.save();

    if (themeId === '__system') {
      nativeTheme.themeSource = 'system';
      this.applyTheme(this.getSystemThemeId());
    } else {
      const theme = themes.find((theme) => theme._id === themeId);

      if (!theme) throw new RangeError(`No theme found with ID ${themeId}`);

      nativeTheme.themeSource = theme.themeSource;
      this.applyTheme(theme._id);
    }
  }

  applyTheme(themeId: Theme['_id']): void {
    const theme = themes.find((theme) => theme._id === themeId);

    if (!theme) throw new RangeError(`No theme found with ID ${themeId}`);

    this.window.webContents.send(channels.THEME_APPLY, theme);
  }

  getSystemThemeId(): Theme['_id'] {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }
}
