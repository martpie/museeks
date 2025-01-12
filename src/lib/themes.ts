import darkTheme from '../themes/dark.json';
import lightTheme from '../themes/light.json';
// IMPROVE ME: scan the directory for all json files instead
import type { Theme } from '../types/syncudio';
import { logAndNotifyError } from './utils';

export const themes: Record<string, Theme> = {
  light: lightTheme as Theme,
  dark: darkTheme as Theme,
};

const DEFAULT_THEME = themes.light;

export function getTheme(themeID: string): Theme {
  const theme = themes[themeID];

  if (theme === undefined) {
    logAndNotifyError(`Unknown theme "${themeID}", defaulting to "light"`);
    return DEFAULT_THEME;
  }

  return theme;
}
