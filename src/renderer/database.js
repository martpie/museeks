import linvodb from 'linvodb3';
import leveljs from 'level-js';
import { remote } from 'electron';

// This may not work on windows. Compile with:
// node-gyp rebuild --target=1.6.2 --arch=x64 --dist-url=https://atom.io/download/atom-shell
linvodb.defaults.store = { db: leveljs };
linvodb.dbPath = remote.app.getPath('userData');
