import { Theme } from '../../shared/types/interfaces';

// IMPROVE ME: scan the directory for all json files instead
const lightTheme: Theme = require('../styles/themes/light.json');
const darkTheme: Theme = require('../styles/themes/dark.json');

export const themes = [lightTheme, darkTheme];
