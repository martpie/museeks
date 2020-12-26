import { Theme } from '../../../shared/types/interfaces';

// IMPROVE ME: scan the directory for all json files instead
const lightTheme: Theme = require('./light.json');
const darkTheme: Theme = require('./dark.json');

export const themes = [lightTheme, darkTheme];
