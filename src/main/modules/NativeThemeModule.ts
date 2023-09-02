/**
 * Module in charge of telling the renderer process which native theme is used
 */

import type Store from 'electron-store';
import { ipcMain, nativeTheme } from 'electron';

import channels from '../../shared/lib/ipc-channels';
import { themes } from '../../shared/lib/themes';
import { Config, Theme } from '../../shared/types/museeks';

import ModuleWindow from './BaseWindowModule';

export default class NativeThemeModule extends ModuleWindow {
  protected config: Store<Config>;

  constructor(window: Electron.BrowserWindow, config: Store<Config>) {
    super(window);
    this.config = config;

    const theme = this.getTheme();
    nativeTheme.themeSource = theme.themeSource;
  }

  async load(): Promise<void> {
    /**
     * Update the UI when someone changes the global theme settings
     */
    nativeTheme.on('updated', () => {
      if (this.getThemeID() === '__system') {
        this.applyTheme(this.getSystemThemeID());
      }

      // Otherwise, we don't care
    });

    ipcMain.handle(channels.THEME_GET_ID, () => this.getThemeID());

    /**
     * Handle themeSource update and returns the theme variables for a given
     * themeID
     */
    ipcMain.handle(
      channels.THEME_SET_ID,
      (_event, themeID: Config['theme']) => {
        this.setThemeID(themeID);
      },
    );

    ipcMain.handle(channels.THEME_GET, () => {
      let themeID = this.getThemeID();

      if (themeID === '__system') themeID = this.getSystemThemeID();

      const theme = themes.find((theme) => theme._id === themeID);

      if (!theme) throw new RangeError(`No theme found with ID ${themeID}`);

      return theme;
    });
  }

  getThemeID(): Config['theme'] {
    return this.config.get('theme') ?? '__system';
  }

  getTheme(): Theme {
    let themeID = this.getThemeID();

    if (themeID === '__system') {
      themeID = this.getSystemThemeID();
    }

    const theme = themes.find((theme) => theme._id === themeID);

    if (!theme) throw new RangeError(`No theme found with ID ${themeID}`);

    return theme;
  }

  setThemeID(themeID: Config['theme']): void {
    this.config.set('theme', themeID);

    if (themeID === '__system') {
      nativeTheme.themeSource = 'system';
      this.applyTheme(this.getSystemThemeID());
    } else {
      const theme = themes.find((theme) => theme._id === themeID);

      if (!theme) throw new RangeError(`No theme found with ID ${themeID}`);

      nativeTheme.themeSource = theme.themeSource;
      this.applyTheme(theme._id);
    }
  }

  applyTheme(themeID: Theme['_id']): void {
    const theme = themes.find((theme) => theme._id === themeID);

    if (!theme) throw new RangeError(`No theme found with ID ${themeID}`);

    this.window.webContents.send(channels.THEME_APPLY, theme);
  }

  getSystemThemeID(): Theme['_id'] {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }
}
