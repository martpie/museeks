import Promise from 'bluebird';
import mutate from 'xtend/mutable';
const fs = Promise.promisifyAll(require('fs'));

import defaultConfig from '../../shared/lib/config';

const serializeConfig = () => JSON.stringify(defaultConfig, null, 4);
const deserializeConfig = (data) => JSON.parse(data);

const save = () => fs.writeFileAsync(defaultConfig.path, serializeConfig());

const saveSync = () => fs.writeFileSync(defaultConfig.path, serializeConfig());

const setConfigPath = (path) => defaultConfig.path = path;

const extendConfig = (config) => mutate(defaultConfig, config);

const load = () => {
    return fs.readFileAsync(defaultConfig.path)
    .then(deserializeConfig)
    .then(extendConfig)
    .catch(() => save().then(load));
};

export default {
    load,
    save,
    saveSync,
    setConfigPath,
    extendConfig
};
