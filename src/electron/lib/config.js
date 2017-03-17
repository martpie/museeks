import teeny from 'teeny-conf';
import { join } from 'path';
import { app } from 'electron';

const configPath = app.getPath('userData');
const config = new teeny(join(configPath, 'config.json'));

config.loadOrCreateSync();

export default config;
