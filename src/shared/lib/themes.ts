import { Theme } from '../types/museeks';
// IMPROVE ME: scan the directory for all json files instead
import lightTheme from '../themes/light.json';
import darkTheme from '../themes/dark.json';
import darkLegacyTheme from '../themes/dark-legacy.json';

export const themes = [lightTheme as Theme, darkTheme as Theme, darkLegacyTheme as Theme];
