import linvodb from 'linvodb3';
import backend from 'leveldown';
import { app } from 'electron';

// Leveldown may not work on windows. Compile with:
// node-gyp rebuild --target=1.6.2 --arch=x64 --dist-url=https://atom.io/download/atom-shell

class Database {
    constructor(lib) {
        this.lib = lib;
    }

    start = () => {
        const defaultPath = app.getPath('userData');

        linvodb.defaults.store = { db: backend };
        linvodb.dbPath = this.lib.store.getState().config.electron.database.path || defaultPath;

        // load models now that database path has been initialised
        this.lib.models.track = require('./models/track').default;
        this.lib.models.playlist = require('./models/playlist').default;
    }
}

export default Database;
