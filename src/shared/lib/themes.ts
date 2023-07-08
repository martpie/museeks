import { Theme } from '../types/museeks';
import fs from 'fs';

const themes : Array<Theme> = [];
fs.readdirSync('./src/shared/themes').forEach(name => {
  const theme = require('../../src/shared/themes/' + name);
  themes.push(theme as Theme);
})

export {
    themes
}