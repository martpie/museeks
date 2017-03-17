import linvodb from 'linvodb3';
import leveljs from 'level-js';
import { remote } from 'electron';

linvodb.defaults.store = { db: leveljs };
linvodb.dbPath = remote.app.getPath('userData');
