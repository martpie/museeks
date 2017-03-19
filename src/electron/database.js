import linvodb from 'linvodb3';
import backend from 'leveldown';
import { app } from 'electron';

// This may not work on windows. Compile with:
// node-gyp rebuild --target=1.6.2 --arch=x64 --dist-url=https://atom.io/download/atom-shell
linvodb.defaults.store = { db: backend };
linvodb.dbPath = app.getPath('userData');
