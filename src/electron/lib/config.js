import Promise from 'bluebird';
import mutate from 'xtend/mutable';

import store from '../redux/store';
import defaultConfig from '../../shared/lib/config';

const fs = Promise.promisifyAll(require('fs'));

const serializeConfig = (data) => JSON.stringify(data, null, 4);

const deserializeConfig = (data) => JSON.parse(data);

const save = (data) => fs.writeFileAsync(defaultConfig.path, serializeConfig(data));

const saveSync = (data) => fs.writeFileSync(defaultConfig.path, serializeConfig(data));

const setConfigPath = (path) => defaultConfig.path = path;

const extendConfig = (config) => mutate(defaultConfig, config);

const load = () => {
    return fs.readFileAsync(defaultConfig.path)
    .then(deserializeConfig)
    .then(extendConfig)
    .catch(() => save({}).then(load));
};

export default {
    load,
    save,
    saveSync,
    setConfigPath,
    extendConfig
};
