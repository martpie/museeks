import linvodb from 'linvodb3';
import backend from 'leveldown';
import { app } from 'electron';

// This may not work on windows. Compile with:
// node-gyp rebuild --target=1.6.2 --arch=x64 --dist-url=https://atom.io/download/atom-shell
linvodb.defaults.store = { db: backend };

class Database {
    constructor(lib) {
        const defaultPath = app.getPath('userData');
        console.log('DDDDDDDDDDDDDDDDDDD', lib.store.getState().config.electron.database.path)
        linvodb.dbPath = lib.store.getState().config.electron.database.path || defaultPath;
    }
}

export default Database;
