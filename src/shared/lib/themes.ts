import { Theme } from '../types/museeks';
import fs from 'fs';

const themes : Array<Theme> = [];
fs.readdirSync('./src/shared/themes').forEach(name => {
  if(name.split('.').pop() == 'json') {
    const theme = require('../../src/shared/themes/' + name);
    themes.push(theme as Theme);
  }
})

export {
    themes
}