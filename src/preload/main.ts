import os from 'os';
import path from 'path';
import { app } from 'electron';
import TeenyConf from 'teeny-conf';
import { Config } from '../shared/types/museeks';

const pathUserData = app.getPath('userData');

// When editing something here, please update museeks.d.ts to extend the
// window.__museeks global object.

// TODO: convert that to contextBridge.exposeToMainWorld
window.__museeks = {
  platform: os.platform(),
  version: app.getVersion(),
  config: new TeenyConf<Config>(path.join(pathUserData, 'config.json'), {}),
};
