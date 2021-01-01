import { Theme } from '../../shared/types/museeks';

// IMPROVE ME: scan the directory for all json files instead
const lightTheme: Theme = require('../styles/themes/light.json');
const darkTheme: Theme = require('../styles/themes/dark.json');
const darkLegacyTheme: Theme = require('../styles/themes/dark-legacy.json');

export const themes = [lightTheme, darkTheme, darkLegacyTheme];
