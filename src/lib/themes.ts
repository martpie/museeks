import { Theme as ThemeID } from '@tauri-apps/api/window';

// IMPROVE ME: scan the directory for all json files instead
import { Theme } from '../types/museeks';
import lightTheme from '../themes/light.json';
import darkTheme from '../themes/dark.json';

export const themes: Record<ThemeID, Theme> = {
  light: lightTheme as Theme,
  dark: darkTheme as Theme,
};
