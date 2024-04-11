import type { Theme as ThemeID } from '@tauri-apps/api/window';

import darkTheme from '../themes/dark.json';
import lightTheme from '../themes/light.json';
// IMPROVE ME: scan the directory for all json files instead
import type { Theme } from '../types/museeks';

export const themes: Record<ThemeID, Theme> = {
  light: lightTheme as Theme,
  dark: darkTheme as Theme,
};
