const linvodb = require('linvodb3');
const leveljs = require('level-js');
const { app } = require('electron');

linvodb.defaults.store = { db: leveljs };
linvodb.dbPath = app.getPath('userData');
