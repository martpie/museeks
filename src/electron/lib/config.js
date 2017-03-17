const teeny = require('teeny-conf');
const { join } = require('path');
const { app } = require('electron');

const configPath = app.getPath('userData');
const config = new teeny(join(configPath, 'config.json'));

config.loadOrCreateSync();

module.exports = config;
