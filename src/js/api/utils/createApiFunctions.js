const axios = require('axios');

const createApiFunctions = (libs) => {

    const reduceLib = (lib) => lib.routes.reduce((output, route) => {
        // Create a function that call this api
        output[route.path] = (config) => axios({
            ...config,
            method: route.method,
            url: `http://${config.ip || 'localhost'}:54321/api/${lib.namespace}/${route.path}`
        })
        .then((response) => response.data);
        return output;
    }, {});

    const reduceLibs = (libs) => libs.reduce((output, lib) => {
        output[lib.namespace] = reduceLib(lib)
        return output;
    }, {});

    return reduceLibs(libs);
}

module.exports = createApiFunctions;
