import { Theme } from '../types/museeks';
// IMPROVE ME: scan the directory for all json files instead
import lightTheme from '../themes/light.json';
import darkTheme from '../themes/dark.json';

export const themes = [lightTheme as Theme, darkTheme as Theme];
