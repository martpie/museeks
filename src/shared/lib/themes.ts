import fs from 'fs';

import { Theme } from '../types/museeks';

const themes: Array<Theme> = [];
fs.readdirSync('./src/shared/themes').forEach((name) => {
  if (name.split('.').pop() == 'json') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const theme = require('../../src/shared/themes/' + name);
    themes.push(theme as Theme);
  }
});

export { themes };
