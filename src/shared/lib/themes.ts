import { Theme } from '../types/museeks';
// IMPROVE ME: scan the directory for all json files instead
import fs from 'fs';

const themes : Array<Theme> = [];
fs.readdirSync('./src/shared/themes').forEach(name => {
  const theme = require('../../src/shared/themes/' + name);
  themes.push(theme as Theme);
})

export {
    themes
}