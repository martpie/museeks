import { Theme } from '../types/museeks';

// IMPROVE ME: scan the directory for all json files instead
const lightTheme: Theme = require('../../themes/light.json');
const darkTheme: Theme = require('../../themes/dark.json');
const darkLegacyTheme: Theme = require('../../themes/dark-legacy.json');

export const themes = [lightTheme, darkTheme, darkLegacyTheme];
