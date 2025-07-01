import { t } from '@lingui/core/macro';

import darkTheme from '../themes/dark.json' with { type: 'json' };
import lightTheme from '../themes/light.json' with { type: 'json' };
// IMPROVE ME: scan the directory for all json files instead
import type { Theme } from '../types/museeks';
import { logAndNotifyError } from './utils';

export const themes: Record<string, Theme> = {
  light: lightTheme as Theme,
  dark: darkTheme as Theme,
};

const DEFAULT_THEME = themes.light;

/**
 * Given a theme ID, return the corresponding theme variables
 */
export function getTheme(themeID: string): Theme {
  const theme = themes[themeID];

  if (theme === undefined) {
    logAndNotifyError(`Unknown theme "${themeID}", defaulting to "light"`);
    return DEFAULT_THEME;
  }

  return theme;
}

/**
 * Get the theme name in the current language
 */
export function getTranslatedThemeName(themeName: string) {
  switch (themeName) {
    case 'Light':
      return t`Light`;
    case 'Dark':
      return t`Dark`;
  }

  return themeName;
}
