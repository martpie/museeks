const axios        = require('axios');

const createApiFunctions = (libs) => {

    const reduceLib = (lib) => lib.routes.reduce((output, route) => {
        // Create a function that call this api
        output[route.path] = () => axios({
            method: route.method,
            url: `/api/${lib.namespace}/${route.path}`
        });
        return output;
    }, {});

    const reduceLibs = (libs) => libs.reduce((output, lib) => {
        output[lib.namespace] = reduceLib(lib)
        return output;
    }, {});

    return reduceLibs(libs);
}

module.exports = createApiFunctions;

