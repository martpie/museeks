import os from 'os';
import path from 'path';
import { app } from '@electron/remote';
import TeenyConf from 'teeny-conf';
import { Config } from '../shared/types/museeks';

const pathUserData = app.getPath('userData');

// TODO: convert that to contextBridge.exposeToMainWorld
window.__museeks = {
  platform: os.platform(),
  config: new TeenyConf<Config>(path.join(pathUserData, 'config.json'), {}),
};
